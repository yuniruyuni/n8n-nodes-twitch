import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrUsername } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const raidEventNames = ['channel.raid'];

// Raid events have special directional parameters
const raidFields: INodeProperties[] = [
	{
		displayName: 'Raid Direction',
		name: 'raidDirection',
		type: 'options',
		options: [
			{
				name: 'Incoming (To Broadcaster)',
				value: 'to',
				description: 'Receive raids to this broadcaster',
			},
			{
				name: 'Outgoing (From Broadcaster)',
				value: 'from',
				description: 'Monitor raids from this broadcaster',
			},
		],
		default: 'to',
		description: 'Whether to monitor incoming or outgoing raids',
	},
	{
		displayName: 'Broadcaster ID or Username',
		name: 'raidBroadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username for raid events',
	},
];

export const raidEventOptions = [{ name: 'Channel Raid', value: 'channel.raid' }];

export const raidEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: raidEventNames } }, raidFields),
];

export const RAID_EVENTS = raidEventNames;

/**
 * Build condition object for raid events (special directional logic)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const raidDirection = context.getNodeParameter('raidDirection') as string;
	const raidBroadcasterIdInput = context.getNodeParameter('raidBroadcasterId') as string;
	const raidBroadcasterId = await resolveUserIdOrUsername.call(context, raidBroadcasterIdInput);

	if (raidDirection === 'to') {
		condition.to_broadcaster_user_id = raidBroadcasterId;
	} else {
		condition.from_broadcaster_user_id = raidBroadcasterId;
	}

	return condition;
};
