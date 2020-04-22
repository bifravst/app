import { IotData } from 'aws-sdk'
import { ThingState } from '../@types/aws-device'
import { Option, none, some } from 'fp-ts/lib/Option'

export const getThingState = (iotData: IotData) => async (
	deviceId: string,
): Promise<Option<ThingState>> => {
	try {
		const { payload } = await iotData
			.getThingShadow({
				thingName: deviceId,
			})
			.promise()
		if (!payload) return none
		const shadow = JSON.parse(payload.toString())
		if (!shadow.state) return none
		const { reported, desired } = shadow.state
		console.log('[reported]', reported)
		console.log('[desired]', desired)
		return some(shadow.state as ThingState)
	} catch (err) {
		console.error(err)
		return none
	}
}
