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

export type Accelerometer = {
	v: [number, number, number]
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

export type ReceivedProperty<A> = {
	value: A
	receivedAt: Date
}

export type MakeReceivedProperty<Type> = {
	readonly [Key in keyof Type]: ReceivedProperty<Type[Key]>
}

export type ReportedConfigState = MakeReceivedProperty<DeviceConfig>
export type ReportedGps = MakeReceivedProperty<Gps>
export type ReportedBattery = MakeReceivedProperty<Battery>
export type ReportedAccelerometer = {
	ts: ReceivedProperty<number>
	v: {
		value: [ReceivedProperty<number>]
		receivedAt: Date
	}
}
export type ReportedDeviceInformation = {
	ts: ReceivedProperty<number>
	v: {
		value: {
			band: ReceivedProperty<number>
			nw: ReceivedProperty<string>
			iccid: ReceivedProperty<string>
			modV: ReceivedProperty<string>
			brdV: ReceivedProperty<string>
			appV: ReceivedProperty<string>
		}
		receivedAt: Date
	}
}
export type ReportedRoamingInformation = {
	ts: ReceivedProperty<number>
	v: {
		value: {
			area: ReceivedProperty<number>
			mccmnc: ReceivedProperty<number>
			cell: ReceivedProperty<number>
			ip: ReceivedProperty<string>
			rsrp: ReceivedProperty<number>
		}
		receivedAt: Date
	}
}

export type ReportedState = {
	cfg?: Partial<ReportedConfigState>
	gps?: ReportedGps
	bat?: ReportedBattery
	dev?: ReportedDeviceInformation
	roam?: ReportedRoamingInformation
	acc?: ReportedAccelerometer
}
