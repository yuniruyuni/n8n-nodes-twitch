import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const hypeTrainEventNames = [
	'channel.hype_train.begin',
	'channel.hype_train.progress',
	'channel.hype_train.end',
];

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

export const hypeTrainEventOptions = [
	{ name: 'Channel Hype Train Begin', value: 'channel.hype_train.begin' },
	{ name: 'Channel Hype Train End', value: 'channel.hype_train.end' },
	{ name: 'Channel Hype Train Progress', value: 'channel.hype_train.progress' },
];

export const hypeTrainEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: hypeTrainEventNames } }, broadcasterIdField),
];

export const HYPE_TRAIN_EVENTS = hypeTrainEventNames;
