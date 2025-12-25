import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const pollEventNames = ['channel.poll.begin', 'channel.poll.progress', 'channel.poll.end'];

// These events require broadcaster_user_id only
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

export const pollEventOptions = [
	{ name: 'Channel Poll Begin', value: 'channel.poll.begin' },
	{ name: 'Channel Poll End', value: 'channel.poll.end' },
	{ name: 'Channel Poll Progress', value: 'channel.poll.progress' },
];

export const pollEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: pollEventNames } }, broadcasterIdField),
];

export const POLL_EVENTS = pollEventNames;
