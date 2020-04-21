import {
	DeviceConfig,
	Gps,
	Battery,
	DeviceInformation,
	RoamingInformation,
} from './device-state'

type PropertyMetadata = {
	$lastUpdated: string
	$lastUpdatedVersion?: number
}

export type DeviceTwinState = {
	[key: string]: any
	$version: number
}

export type DeviceTwin = {
	desired: DeviceTwinState & {
		cfg?: Partial<DeviceConfig>
		$metadata: PropertyMetadata & {
			cfg?: PropertyMetadata & {
				act: PropertyMetadata
				actwt: PropertyMetadata
				mvres: PropertyMetadata
				mvt: PropertyMetadata
				gpst: PropertyMetadata
				celt: PropertyMetadata
				acct: PropertyMetadata
			}
		}
	}
	reported: DeviceTwinState & {
		cfg?: Partial<DeviceConfig>
		gps?: Gps
		bat?: Battery
		dev?: DeviceInformation
		roam?: RoamingInformation
		$metadata: PropertyMetadata & {
			cfg?: PropertyMetadata & {
				act: PropertyMetadata
				actwt: PropertyMetadata
				mvres: PropertyMetadata
				mvt: PropertyMetadata
				gpst: PropertyMetadata
				celt: PropertyMetadata
				acct: PropertyMetadata
			}
			gps?: PropertyMetadata & {
				v: PropertyMetadata & {
					lat: PropertyMetadata
					lng: PropertyMetadata
					acc: PropertyMetadata
					alt: PropertyMetadata
					spd: PropertyMetadata
					hdg: PropertyMetadata
				}
				ts: PropertyMetadata
			}
			bat?: PropertyMetadata & {
				v: PropertyMetadata
				ts: PropertyMetadata
			}
			dev?: PropertyMetadata & {
				v: PropertyMetadata & {
					band: PropertyMetadata
					nw: PropertyMetadata
					iccid: PropertyMetadata
					modV: PropertyMetadata
					brdV: PropertyMetadata
					appV: PropertyMetadata
				}
				ts: PropertyMetadata
			}
			roam?: PropertyMetadata & {
				v: PropertyMetadata & {
					area: PropertyMetadata
					mccmnc: PropertyMetadata
					cell: PropertyMetadata
					ip: PropertyMetadata
					rsrp: PropertyMetadata
				}
				ts: PropertyMetadata
			}
		}
	}
}
