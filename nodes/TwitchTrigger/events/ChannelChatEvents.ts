import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const chatEventNames = [
	'channel.chat.clear',
	'channel.chat.clear_user_messages',
	'channel.chat.message',
	'channel.chat.message_delete',
	'channel.chat.notification',
	'channel.chat_settings.update',
	'channel.chat.user_message_hold',
	'channel.chat.user_message_update',
];

// These events require broadcaster_user_id + user_id
const broadcasterIdField: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description:
			'The broadcaster user ID or username to monitor. If a username is provided, it will be automatically converted to user ID.',
	},
];

const userIdField: INodeProperties[] = [
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description:
			'The user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
];

export const chatEventOptions = [
	{ name: 'Channel Chat Clear', value: 'channel.chat.clear' },
	{ name: 'Channel Chat Clear User Messages', value: 'channel.chat.clear_user_messages' },
	{ name: 'Channel Chat Message', value: 'channel.chat.message' },
	{ name: 'Channel Chat Message Delete', value: 'channel.chat.message_delete' },
	{ name: 'Channel Chat Notification', value: 'channel.chat.notification' },
	{ name: 'Channel Chat Settings Update', value: 'channel.chat_settings.update' },
	{ name: 'Channel Chat User Message Hold', value: 'channel.chat.user_message_hold' },
	{ name: 'Channel Chat User Message Update', value: 'channel.chat.user_message_update' },
];

export const chatEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: chatEventNames } }, [
		...broadcasterIdField,
		...userIdField,
	]),
];

export const CHAT_EVENTS = chatEventNames;
