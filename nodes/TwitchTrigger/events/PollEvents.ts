import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const pollEventNames = ['channel.poll.begin', 'channel.poll.progress', 'channel.poll.end'];

// These events require broadcaster_user_id only
const broadcasterIdField: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description:
			'The broadcaster user ID or login name to monitor. If a login name is provided, it will be automatically converted to user ID.',
	},
];

export const pollEventOptions = [
	{ name: 'Channel Poll Begin', value: 'channel.poll.begin' },
	{ name: 'Channel Poll End', value: 'channel.poll.end' },
	{ name: 'Channel Poll Progress', value: 'channel.poll.progress' },
];

export const pollEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: pollEventNames } }, broadcasterIdField),
];

export const POLL_EVENTS = pollEventNames;

/**
 * Build condition object for poll events (broadcaster_user_id only)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;
	return condition;
};
