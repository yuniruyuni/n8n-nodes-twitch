import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const goalEventNames = ['channel.goal.begin', 'channel.goal.progress', 'channel.goal.end'];

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

export const goalEventOptions = [
	{ name: 'Channel Goal Begin', value: 'channel.goal.begin' },
	{ name: 'Channel Goal End', value: 'channel.goal.end' },
	{ name: 'Channel Goal Progress', value: 'channel.goal.progress' },
];

export const goalEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: goalEventNames } }, broadcasterIdField),
];

export const GOAL_EVENTS = goalEventNames;

/**
 * Build condition object for goal events (broadcaster_user_id only)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;
	return condition;
};
