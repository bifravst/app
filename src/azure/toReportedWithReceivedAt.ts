import { DeviceTwinReported } from '../@types/azure-device'
import {
	ReportedConfigState,
	ReportedGps,
	ReportedBattery,
	ReportedRoamingInformation,
	ReportedDeviceInformation,
	ReportedState,
} from '../@types/device-state'

/**
 * Converts the Azure reported Twin state to the generic format used in the app.
 * This is added to support multiple cloud vendors with one app source code.
 */
export const toReportedWithReceivedAt = (
	reported: DeviceTwinReported,
): ReportedState => {
	const { $metadata } = reported
	return {
		cfg:
			reported.cfg &&
			Object.entries(reported.cfg).reduce(
				(cfg, [k, v]) => ({
					...cfg,
					[k as keyof ReportedConfigState]: {
						value: v,
						receivedAt: new Date(
							$metadata?.cfg?.[k as keyof ReportedConfigState]
								.$lastUpdated as string,
						),
					},
				}),
				{} as Partial<ReportedConfigState>,
			),
		gps:
			reported.gps &&
			Object.entries(reported.gps).reduce(
				(gps, [k, v]) => ({
					...gps,
					[k as keyof ReportedGps]: {
						value: v,
						receivedAt: new Date(
							$metadata?.gps?.[k as keyof ReportedGps].$lastUpdated as string,
						),
					},
				}),
				{} as ReportedGps,
			),
		bat:
			reported.bat &&
			Object.entries(reported.bat).reduce(
				(bat, [k, v]) => ({
					...bat,
					[k as keyof ReportedBattery]: {
						value: v,
						receivedAt: new Date(
							$metadata?.bat?.[k as keyof ReportedBattery]
								.$lastUpdated as string,
						),
					},
				}),
				{} as ReportedBattery,
			),
		roam:
			reported.roam &&
			Object.entries(reported.roam).reduce(
				(roam, [k, v]) => ({
					...roam,
					[k as keyof ReportedRoamingInformation]: {
						value: v,
						receivedAt: new Date(
							$metadata?.roam?.[k as keyof ReportedRoamingInformation]
								.$lastUpdated as string,
						),
					},
				}),
				{} as ReportedRoamingInformation,
			),
		dev:
			reported.dev &&
			Object.entries(reported.dev).reduce(
				(dev, [k, v]) => ({
					...dev,
					[k as keyof ReportedDeviceInformation]: {
						value: v,
						receivedAt: new Date(
							$metadata?.dev?.[k as keyof ReportedDeviceInformation]
								.$lastUpdated as string,
						),
					},
				}),
				{} as ReportedDeviceInformation,
			),
	}
}
