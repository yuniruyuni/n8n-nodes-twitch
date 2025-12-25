import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const predictionEventNames = [
	'channel.prediction.begin',
	'channel.prediction.progress',
	'channel.prediction.lock',
	'channel.prediction.end',
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

export const predictionEventOptions = [
	{ name: 'Channel Prediction Begin', value: 'channel.prediction.begin' },
	{ name: 'Channel Prediction End', value: 'channel.prediction.end' },
	{ name: 'Channel Prediction Lock', value: 'channel.prediction.lock' },
	{ name: 'Channel Prediction Progress', value: 'channel.prediction.progress' },
];

export const predictionEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: predictionEventNames } }, broadcasterIdField),
];

export const PREDICTION_EVENTS = predictionEventNames;
