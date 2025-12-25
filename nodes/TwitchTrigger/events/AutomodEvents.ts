import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const automodEventNames = [
	'automod.message.hold',
	'automod.message.update',
	'automod.settings.update',
	'automod.terms.update',
];

// These events require broadcaster_user_id + moderator_user_id
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

const moderatorIdField: INodeProperties[] = [
	{
		displayName: 'Moderator ID or Username',
		name: 'moderatorId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description:
			'The moderator user ID or username. If a username is provided, it will be automatically converted to user ID.',
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
