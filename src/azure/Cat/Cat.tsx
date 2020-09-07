import React, { useState, useEffect } from 'react'
import { ApiClient, Device } from '../api'
import { CatCard } from '../../Cat/CatCard'
import { CatHeader, CatPersonalization } from '../../Cat/CatPersonality'
import { CardHeader, CardBody, Alert, Card } from 'reactstrap'
import { emojify } from '../../Emojify/Emojify'
import { Collapsable } from '../../Collapsable/Collapsable'
import { DeleteCat } from '../../Cat/DeleteCat'
import { DisplayError } from '../../Error/Error'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { isLeft } from 'fp-ts/lib/Either'
import { Loading } from '../../Loading/Loading'
import { LoadedCat } from '../../Cat/CatLoader'
import { Settings } from '../../Settings/Settings'
import * as signalR from '@microsoft/signalr'
import { connect } from '../signalr'
import * as merge from 'deepmerge'
import { DeviceTwin } from '../../@types/azure-device'
import { CatMapContainer, Location, CellLocation } from '../../Map/Map'
import { Toggle } from '../../Toggle/Toggle'
import { ReportedTime } from '../../ReportedTime/ReportedTime'
import {
	toReportedWithReceivedAt,
	toReceivedProps,
} from '../toReportedWithReceivedAt'
import { ConnectionInformation } from '../../ConnectionInformation/ConnectionInformation'
import { DeviceInfo } from '../../DeviceInformation/DeviceInformation'
import { AccelerometerDiagram } from '../../AccelerometerDiagram/AccelerometerDiagram'
import { FOTA } from '../FOTA/FOTA'
import { Jobs } from '../FOTA/FOTAJob'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { HistoricalDataChart } from '../../HistoricalData/HistoricalDataChart'
import { HistoricalButtonPresses } from '../../HistoricalButtonPresses/HistoricalButtonPresses'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'

const isNameValid = (name: string) => /^.{1,255}$/i.test(name)

export const Cat = ({
	apiClient,
	cat,
	update,
}: {
	apiClient: ApiClient
	cat: Device & LoadedCat
	update: (cat: Device & LoadedCat) => void
}) => {
	const reportedWithTime = toReportedWithReceivedAt(cat.state.reported)
	const fotaJob =
		cat.state.desired.firmware &&
		cat.state.desired.$metadata.firmware &&
		toReceivedProps(
			cat.state.desired.firmware,
			cat.state.desired.$metadata.firmware,
		)

	const fotaJobs = fotaJob
		? [{ job: fotaJob, status: reportedWithTime.firmware }]
		: []

	const [deleted, setDeleted] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<ErrorInfo>()

	// Listen for state changes
	useEffect(() => {
		let isCancelled = false
		let connection: signalR.HubConnection
		connect(apiClient)
			.then((c) => {
				connection = c
				c.on(`deviceState:${cat.id}`, (data) => {
					if (!isCancelled) {
						console.log('state', data.state)
						update({
							...cat,
							state: merge.all<DeviceTwin>([cat.state, data.state]),
						})
					}
				})
			})
			.catch(setError)
		return () => {
			isCancelled = true

			connection?.stop().catch(console.error)
		}
	}, [cat, apiClient, update])

	if (deleting) {
		return (
			<Card>
				<CardBody>
					<Loading text={`Deleting ${cat.id}...`} />
				</CardBody>
			</Card>
		)
	}

	if (deleted) {
		return (
			<Alert color={'success'}>
				The cat <code>{cat.id}</code> has been deleted.
			</Alert>
		)
	}

	if (error) return <DisplayError error={error} />

	const onAvatarChange = (avatar: Blob) => {
		// Display image directly
		const reader = new FileReader()
		reader.onload = (e: any) => {
			update({
				...cat,
				avatar: e.target.result,
			})
		}
		reader.readAsDataURL(avatar)

		apiClient
			.storeImage(avatar)
			.then((maybeUrl) => {
				if (isLeft(maybeUrl)) {
					setError(maybeUrl.left)
				} else {
					apiClient
						.setDeviceAvatar(cat.id, maybeUrl.right.url)
						.then((res) => {
							if (isLeft(res)) {
								setError(res.left)
							}
						})
						.catch(setError)
				}
			})
			.catch(setError)
	}

	const onNameChange = (name: string) => {
		update({
			...cat,
			name,
		})
		apiClient
			.setDeviceName(cat.id, name)
			.then((res) => {
				if (isLeft(res)) {
					setError(res.left)
				}
			})
			.catch(setError)
	}

	const onReportedFOTAJobProgressCreate = ({
		data,
		version,
	}: {
		data: ArrayBuffer
		version: string
	}) => {
		apiClient
			.storeDeviceUpdate(data)
			.then((maybeStoredUpdate) => {
				if (isLeft(maybeStoredUpdate)) {
					setError(maybeStoredUpdate.left)
				} else {
					apiClient
						.setPendingDeviceUpdate({
							id: cat.id,
							url: maybeStoredUpdate.right.url,
							version,
						})
						.then((res) => {
							if (isLeft(res)) {
								setError(res.left)
							}
						})
						.catch(setError)
				}
			})
			.catch(setError)
	}

	let deviceLocation: Location | undefined = undefined
	if (reportedWithTime.gps?.v?.value?.lat !== undefined) {
		deviceLocation = {
			ts: new Date(reportedWithTime.gps?.ts?.value ?? Date.now()),
			position: {
				lat: reportedWithTime.gps.v?.value.lat,
				lng: reportedWithTime.gps.v?.value.lng,
				accuracy: reportedWithTime.gps?.v?.value.acc,
				heading: reportedWithTime.gps?.v?.value.hdg,
			},
		}
	}

	// FIXME: Implement cell geolocation
	const cellLocation: CellLocation | undefined = undefined

	return (
		<CatCard>
			<CatMapContainer>
				<HistoricalDataMap
					deviceLocation={deviceLocation}
					cellLocation={cellLocation}
					cat={cat}
					fetchHistory={async (numEntries) =>
						apiClient
							.queryHistoricalDeviceData(
								`SELECT c.deviceUpdate.properties.reported.gps.v AS v, c.deviceUpdate.properties.reported.gps.ts AS ts FROM c WHERE c.deviceUpdate.properties.reported.gps.v != null AND c.deviceId = "${cat.id}" ORDER BY c.timestamp DESC OFFSET 0 LIMIT ${numEntries}`,
							)
							.then((res) => {
								if (isLeft(res)) return []
								const history = (res.right.result as {
									v: { lat: number; lng: number }
									ts: string
								}[]).map(({ v: { lat, lng }, ts }) => ({
									position: { lat, lng },
									ts: new Date(ts),
								}))
								console.log({ history })
								return history
							})
					}
				/>
			</CatMapContainer>
			<CardHeader>
				<CatHeader
					{...{
						cat,
						isNameValid,
						onAvatarChange,
						onNameChange,
					}}
				></CatHeader>
				{reportedWithTime.roam?.v && reportedWithTime.dev?.v && (
					<Toggle>
						<ConnectionInformation
							mccmnc={reportedWithTime.roam.v.value.mccmnc}
							rsrp={reportedWithTime.roam.v.value.rsrp}
							receivedAt={reportedWithTime.roam.v.receivedAt}
							reportedAt={new Date(reportedWithTime.roam.ts.value)}
							networkOperator={reportedWithTime.dev.v.value.nw}
							iccid={reportedWithTime.dev.v.value.iccid}
						/>
					</Toggle>
				)}
				{reportedWithTime.gps?.v && (
					<Toggle>
						<div className={'info'}>
							{reportedWithTime.gps?.v?.value.spd &&
								emojify(
									` 🏃${Math.round(reportedWithTime.gps?.v?.value.spd)}m/s`,
								)}
							{reportedWithTime.gps?.v?.value.alt &&
								emojify(
									`✈️ ${Math.round(reportedWithTime.gps?.v?.value.alt)}m`,
								)}
							<ReportedTime
								receivedAt={reportedWithTime.gps?.v.receivedAt}
								reportedAt={
									new Date(reportedWithTime.gps?.ts?.value ?? Date.now())
								}
							/>
						</div>
					</Toggle>
				)}
				{reportedWithTime.bat && (
					<Toggle>
						<div className={'info'}>
							{emojify(`🔋 ${reportedWithTime.bat.v.value / 1000}V`)}
							<span />
							<ReportedTime
								receivedAt={reportedWithTime.bat.v.receivedAt}
								reportedAt={new Date(reportedWithTime.bat.ts.value)}
							/>
						</div>
					</Toggle>
				)}
				{reportedWithTime?.env && (
					<Toggle>
						<div className={'info'}>
							{emojify(`🌡️ ${reportedWithTime.env.v.value.temp}°C`)}
							{emojify(`💦 ${Math.round(reportedWithTime.env.v.value.hum)}%`)}
							<ReportedTime
								receivedAt={reportedWithTime.env.v.receivedAt}
								reportedAt={new Date(reportedWithTime.env.ts.value)}
							/>
						</div>
					</Toggle>
				)}
			</CardHeader>
			<CardBody>
				<Collapsable
					id={'cat:personalization'}
					title={<h3>{emojify('⭐ Personalization')}</h3>}
				>
					<CatPersonalization
						{...{
							cat,
							isNameValid,
							onAvatarChange,
							onNameChange,
						}}
					/>
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:settings'}
					title={<h3>{emojify('⚙️ Settings')}</h3>}
				>
					<Settings
						reported={reportedWithTime.cfg}
						desired={cat.state.desired?.cfg}
						onSave={(config) => {
							apiClient.setDeviceConfig(cat.id, config).catch((error) => {
								setError(error)
							})
						}}
					/>
				</Collapsable>
				{reportedWithTime?.dev && reportedWithTime?.roam && (
					<>
						<hr />
						<Collapsable
							id={'cat:information'}
							title={<h3>{emojify('ℹ️ Device Information')}</h3>}
						>
							<DeviceInfo
								key={`${cat.version}`}
								device={reportedWithTime.dev}
								roaming={reportedWithTime.roam}
							/>
						</Collapsable>
					</>
				)}
				{cat.state.reported.dev && (
					<>
						<hr />
						<Collapsable
							id={'cat:fota'}
							title={<h3>{emojify('🌩️ Device Firmware Upgrade (FOTA)')}</h3>}
						>
							<FOTA
								key={`${cat.version}`}
								device={cat.state.reported.dev}
								onCreateUpgradeJob={({ data, version }) => {
									onReportedFOTAJobProgressCreate({ data, version })
								}}
							/>
							<Jobs jobs={fotaJobs} />
						</Collapsable>
					</>
				)}
				{reportedWithTime?.acc && (
					<>
						<hr />
						<Collapsable
							id={'cat:motion'}
							title={<h3>{emojify('🏃 Motion')}</h3>}
						>
							<AccelerometerDiagram values={reportedWithTime.acc.v.value} />
							<ReportedTime
								reportedAt={new Date(reportedWithTime.acc.ts.value)}
								receivedAt={reportedWithTime.acc.v.receivedAt}
							/>
						</Collapsable>
					</>
				)}
				<hr />
				<Collapsable id={'cat:bat'} title={<h3>{emojify('🔋 Battery')}</h3>}>
					<HistoricalDataLoader
						apiClient={apiClient}
						QueryString={`SELECT c.deviceUpdate.properties.reported.bat.v AS v, c.deviceUpdate.properties.reported.bat.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND c.deviceUpdate.properties.reported.bat != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 100`}
						formatFields={({
							v,
							ts,
						}: {
							v: number
							ts: string
						}): { value: number; date: Date } => ({
							value: v,
							date: new Date(ts),
						})}
					>
						{({ data }) => <HistoricalDataChart data={data} type={'line'} />}
					</HistoricalDataLoader>
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:environment'}
					title={<h3>{emojify('🌡️ Temperature')}</h3>}
				>
					<HistoricalDataLoader
						apiClient={apiClient}
						QueryString={`SELECT c.deviceUpdate.properties.reported.env.v.temp AS v, c.deviceUpdate.properties.reported.env.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND c.deviceUpdate.properties.reported.env.v.temp != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 100`}
						formatFields={({
							v,
							ts,
						}: {
							v: number
							ts: string
						}): { value: number; date: Date } => ({
							value: v,
							date: new Date(ts),
						})}
					>
						{({ data }) => <HistoricalDataChart data={data} type={'line'} />}
					</HistoricalDataLoader>
				</Collapsable>
				<hr />
				<Collapsable id={'cat:act'} title={<h3>{emojify('🏋️ Activity')}</h3>}>
					<HistoricalDataLoader
						apiClient={apiClient}
						QueryString={`SELECT c.deviceUpdate.properties.reported.acc.v AS v, c.deviceUpdate.properties.reported.acc.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND  c.deviceUpdate.properties.reported.acc.v != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 100`}
						formatFields={({
							v: { x, y, z },
							ts,
						}: {
							v: { x: number; y: number; z: number }
							ts: string
						}): { value: number; date: Date } => ({
							value: Math.abs(x) + Math.abs(y) + Math.abs(z),
							date: new Date(ts),
						})}
					>
						{({ data }) => <HistoricalDataChart data={data} type={'column'} />}
					</HistoricalDataLoader>
				</Collapsable>
				<hr />
				<Collapsable id={'cat:button'} title={<h3>{emojify('🚨 Button')}</h3>}>
					<HistoricalDataLoader
						apiClient={apiClient}
						QueryString={`SELECT c.deviceUpdate.btn.v AS v, c.deviceUpdate.btn.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND  c.deviceUpdate.btn.v != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 10`}
						formatFields={({
							v,
							ts,
						}: {
							v: number
							ts: string
						}): { value: number; date: Date } => ({
							value: v,
							date: new Date(ts),
						})}
					>
						{({ data }) => <HistoricalButtonPresses data={data} />}
					</HistoricalDataLoader>
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:dangerzone'}
					title={<h3>{emojify('☠️ Danger Zone')}</h3>}
				>
					<DeleteCat
						catId={cat.id}
						onDelete={() => {
							setDeleting(true)
							apiClient
								.deleteDevice(cat.id)
								.then((maybeSuccess) => {
									setDeleting(false)
									if (isLeft(maybeSuccess)) {
										setError(maybeSuccess.left)
									} else {
										setDeleted(maybeSuccess.right.success)
									}
								})
								.catch((error) => {
									setDeleting(false)
									setError(error)
								})
						}}
					/>
				</Collapsable>
			</CardBody>
		</CatCard>
	)
}
