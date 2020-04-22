import {
	ThingStateMetadataProperty,
	ReportedThingState,
} from '../@types/aws-device'
import { ReportedState, ReceivedProperty } from '../@types/device-state'

const toReceivedProp = <A>(
	v: A | undefined,
	{ timestamp }: ThingStateMetadataProperty,
): ReceivedProperty<A> | undefined =>
	v
		? {
				value: v,
				receivedAt: new Date(timestamp * 1000),
		  }
		: undefined

/**
 * Converts the AWS IoT Thing reported shadow to the generic format used in the app.
 * This is added to support multiple cloud vendors with one app source code.
 */
export const toReportedWithReceivedAt = ({
	reported,
	metadata,
}: {
	reported: ReportedThingState
	metadata: ThingStateMetadataProperty
}): ReportedState => ({
	cfg: reported.cfg && {
		act: toReceivedProp<boolean>(reported.cfg.act, metadata.reported.cfg.act),
		actwt: toReceivedProp<number>(
			reported.cfg.actwt,
			metadata.reported.cfg.actwt,
		),
		mvres: toReceivedProp<number>(
			reported.cfg.mvres,
			metadata.reported.cfg.mvres,
		),
		mvt: toReceivedProp<number>(reported.cfg.mvt, metadata.reported.cfg.mvt),
		gpst: toReceivedProp<number>(reported.cfg.gpst, metadata.reported.cfg.gpst),
		celt: toReceivedProp<number>(reported.cfg.celt, metadata.reported.cfg.celt),
		acct: toReceivedProp<number>(reported.cfg.acct, metadata.reported.cfg.acct),
	},
})
