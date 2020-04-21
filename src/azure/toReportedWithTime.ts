import { DeviceTwinState } from '../@types/azure-device'
import {
	ReportedConfigState,
	ReportedGps,
	ReportedBattery,
	ReportedRoamingInformation,
	ReportedDeviceInformation,
} from '../@types/device-state'

export const toReportedWithTime = (state: DeviceTwinState) => {
	const { $metadata } = state
	return {
		cfg: Object.entries(state.cfg).reduce(
			(cfg, [k, v]) => ({
				...cfg,
				[k as keyof ReportedConfigState]: {
					value: v,
					receivedAt: new Date(
						$metadata?.cfg?.[k as keyof ReportedConfigState].$lastUpdated,
					),
				},
			}),
			{} as Partial<ReportedConfigState>,
		),
		gps: Object.entries(state.gps).reduce(
			(gps, [k, v]) => ({
				...gps,
				[k as keyof ReportedGps]: {
					value: v,
					receivedAt: new Date(
						$metadata?.gps?.[k as keyof ReportedGps].$lastUpdated,
					),
				},
			}),
			{} as Partial<ReportedGps>,
		),
		bat: Object.entries(state.bat).reduce(
			(bat, [k, v]) => ({
				...bat,
				[k as keyof ReportedBattery]: {
					value: v,
					receivedAt: new Date(
						$metadata?.bat?.[k as keyof ReportedBattery].$lastUpdated,
					),
				},
			}),
			{} as ReportedBattery,
		),
		roam: Object.entries(state.roam).reduce(
			(roam, [k, v]) => ({
				...roam,
				[k as keyof ReportedRoamingInformation]: {
					value: v,
					receivedAt: new Date(
						$metadata?.roam?.[
							k as keyof ReportedRoamingInformation
						].$lastUpdated,
					),
				},
			}),
			{} as ReportedRoamingInformation,
		),
		dev: Object.entries(state.dev).reduce(
			(dev, [k, v]) => ({
				...dev,
				[k as keyof ReportedDeviceInformation]: {
					value: v,
					receivedAt: new Date(
						$metadata?.dev?.[k as keyof ReportedDeviceInformation].$lastUpdated,
					),
				},
			}),
			{} as ReportedDeviceInformation,
		),
	}
}
