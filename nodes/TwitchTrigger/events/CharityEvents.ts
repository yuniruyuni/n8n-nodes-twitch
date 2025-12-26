import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

const charityEventNames = [
	'channel.charity_campaign.donate',
	'channel.charity_campaign.start',
	'channel.charity_campaign.progress',
	'channel.charity_campaign.stop',
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

export const charityEventOptions = [
	{ name: 'Channel Charity Campaign Donate', value: 'channel.charity_campaign.donate' },
	{ name: 'Channel Charity Campaign Progress', value: 'channel.charity_campaign.progress' },
	{ name: 'Channel Charity Campaign Start', value: 'channel.charity_campaign.start' },
	{ name: 'Channel Charity Campaign Stop', value: 'channel.charity_campaign.stop' },
];

export const charityEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: charityEventNames } }, broadcasterIdField),
];

export const CHARITY_EVENTS = charityEventNames;

/**
 * Build condition object for charity events (broadcaster_user_id only)
 */
export const buildCondition: EventConditionBuilder = async (context) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;
	return condition;
};
