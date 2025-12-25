import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

const charityEventNames = [
	'channel.charity_campaign.donate',
	'channel.charity_campaign.start',
	'channel.charity_campaign.progress',
	'channel.charity_campaign.stop',
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
