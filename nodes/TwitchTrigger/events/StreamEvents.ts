import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const streamEventNames = ['stream.online', 'stream.offline'];

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

export const streamEventOptions = [
	{ name: 'Stream Offline', value: 'stream.offline' },
	{ name: 'Stream Online', value: 'stream.online' },
];

export const streamEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: streamEventNames } }, broadcasterIdField),
];

export const STREAM_EVENTS = streamEventNames;
