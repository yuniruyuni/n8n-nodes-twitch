import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const automodEventNames = [
	'automod.message.hold',
	'automod.message.update',
	'automod.settings.update',
	'automod.terms.update',
];

// These events require broadcaster_user_id + moderator_user_id
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

const moderatorIdField: INodeProperties[] = [
	{
		displayName: 'Moderator',
		name: 'moderatorId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description:
			'The moderator user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
];

export const automodEventOptions = [
	{ name: 'Automod Message Hold', value: 'automod.message.hold' },
	{ name: 'Automod Message Update', value: 'automod.message.update' },
	{ name: 'Automod Settings Update', value: 'automod.settings.update' },
	{ name: 'Automod Terms Update', value: 'automod.terms.update' },
];

export const automodEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: automodEventNames } }, [
		...broadcasterIdField,
		...moderatorIdField,
	]),
];

export const AUTOMOD_EVENTS = automodEventNames;

/**
 * Build condition object for automod events (broadcaster + moderator)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;

	const moderatorIdInput = context.getNodeParameter('moderatorId', '') as string;
	if (moderatorIdInput && moderatorIdInput.trim() !== '') {
		condition.moderator_user_id = await resolveUserIdOrLogin.call(context, moderatorIdInput);
	} else {
		condition.moderator_user_id = broadcasterId;
	}

	return condition;
};
