import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const sharedChatEventNames = [
	'channel.shared_chat.begin',
	'channel.shared_chat.update',
	'channel.shared_chat.end',
];

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

export const sharedChatEventOptions = [
	{ name: 'Channel Shared Chat Begin', value: 'channel.shared_chat.begin' },
	{ name: 'Channel Shared Chat End', value: 'channel.shared_chat.end' },
	{ name: 'Channel Shared Chat Update', value: 'channel.shared_chat.update' },
];

export const sharedChatEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: sharedChatEventNames } }, broadcasterIdField),
];

export const SHARED_CHAT_EVENTS = sharedChatEventNames;

/**
 * Build condition object for shared chat events (broadcaster_user_id only)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;
	return condition;
};
