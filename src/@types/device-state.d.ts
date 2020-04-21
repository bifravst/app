export type DeviceConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gpst: number
	celt: number
	acct: number
}

export type Gps = {
	v: {
		lat: number
		lng: number
		acc: number
		alt: number
		spd: number
		hdg: number
	}
	ts: number
}

export type Battery = {
	v: number
	ts: number
}

export type DeviceInformation = {
	v: {
		band: number
		nw: string
		iccid: string
		modV: string
		brdV: string
		appV: string
	}
	ts: number
}

export type RoamingInformation = {
	v: {
		area: number
		mccmnc: number
		cell: number
		ip: string
		rsrp: number
	}
	ts: number
}

export type ReceivedPropery<A> = {
	value: A
	receivedAt: Date
}

export type MakeReceivedProperty<Type> = {
	readonly [Key in keyof Type]: ReceivedPropery<Type[Key]>
}

export type ReportedConfigState = MakeReceivedProperty<DeviceConfig>
export type ReportedGps = MakeReceivedProperty<Gps>
export type ReportedBattery = MakeReceivedProperty<Battery>
export type ReportedBattery = MakeReceivedProperty<Battery>
export type ReportedDeviceInformation = {
	ts: ReceivedPropery<number>
	v: {
		value: {
			band: ReceivedPropery<number>
			nw: ReceivedPropery<string>
			iccid: ReceivedPropery<string>
			modV: ReceivedPropery<string>
			brdV: ReceivedPropery<string>
			appV: ReceivedPropery<string>
		}
		receivedAt: Date
	}
}
export type ReportedRoamingInformation = {
	ts: ReceivedPropery<number>
	v: {
		value: {
			area: ReceivedPropery<number>
			mccmnc: ReceivedPropery<number>
			cell: ReceivedPropery<number>
			ip: ReceivedPropery<string>
			rsrp: ReceivedPropery<number>
		}
		receivedAt: Date
	}
}
