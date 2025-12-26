import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const userEventNames = ['user.update', 'user.whisper.message'];

// These events require user_id only
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

export const userEventOptions = [
	{ name: 'User Update', value: 'user.update' },
	{ name: 'User Whisper Message', value: 'user.whisper.message' },
];

export const userEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: userEventNames } }, userIdField),
];

export const USER_EVENTS = userEventNames;

/**
 * Build condition object for user events (user_id only)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const userIdInput = context.getNodeParameter('userId') as string;
	condition.user_id = await resolveUserIdOrLogin.call(context, userIdInput);
	return condition;
};
