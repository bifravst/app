import React from 'react'
import { ReportedTime } from '../ReportedTime/ReportedTime'
import styled from 'styled-components'
import {
	ReportedRoamingInformation,
	ReportedDeviceInformation,
} from '../@types/device-state'

const StyledReportedTime = styled(ReportedTime)`
	font-size: 85%;
	opacity: 0.75;
`

export const DeviceInformationDl = styled.dl`
	display: grid;
	grid-template: auto / 1fr 2fr;
	dt,
	dd {
		font-weight: normal;
		padding: 0;
		margin: 0;
		border-bottom: 1px solid #f0f0f0;
	}
	dt {
		padding-right: 1rem;
	}
	dt {
		flex-grow: 1;
	}
`

export const DeviceInfo = ({
	device,
	roaming,
}: {
	device: ReportedDeviceInformation
	roaming?: ReportedRoamingInformation
}) => {
	return (
		<div>
			<h4>Hard- and Software</h4>
			<DeviceInformationDl>
				<dt>Board</dt>
				<dd>
					<code>{device.v.value.brdV.value}</code>
				</dd>
				<dt>Modem</dt>
				<dd>
					<code>{device.v.value.modV.value}</code>
				</dd>
				<dt>Application</dt>
				<dd>
					<code>{device.v.value.appV.value}</code>
				</dd>
			</DeviceInformationDl>
			<h4>Connection</h4>
			<DeviceInformationDl>
				<dt>Band</dt>
				<dd>
					<code>{device.v.value.band.value}</code>
				</dd>
				<dt>ICCID</dt>
				<dd>
					<code>{device.v.value.iccid.value}</code>
				</dd>
				{roaming && (
					<>
						<dt>MCC/MNC</dt>
						<dd>
							<code>{roaming.v.value.mccmnc.value}</code>
						</dd>
						<dt>Area Code</dt>
						<dd>
							<code>{roaming.v.value.area.value}</code>
						</dd>
						<dt>CellID</dt>
						<dd>
							<code>{roaming.v.value.cell.value}</code>
						</dd>
						<dt>IP</dt>
						<dd>
							<code>{roaming.v.value.ip.value}</code>
						</dd>
					</>
				)}
			</DeviceInformationDl>
			<StyledReportedTime
				receivedAt={
					roaming?.v.value.rsrp.receivedAt ?? device.v.value.brdV.receivedAt
				}
				reportedAt={new Date(roaming?.ts.value ?? device.ts.value)}
			/>
		</div>
	)
}
