import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const streamEventNames = ['stream.online', 'stream.offline'];

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

export const streamEventOptions = [
	{ name: 'Stream Offline', value: 'stream.offline' },
	{ name: 'Stream Online', value: 'stream.online' },
];

export const streamEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: streamEventNames } }, broadcasterIdField),
];

export const STREAM_EVENTS = streamEventNames;

/**
 * Build condition object for stream events (broadcaster_user_id only)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;
	return condition;
};
