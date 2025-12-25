import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrUsername } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

// Channel events with broadcaster_user_id only
const broadcasterOnlyEventNames = [
	'channel.update',
	'channel.ad_break.begin',
	'channel.bits.use',
	'channel.subscribe',
	'channel.subscription.end',
	'channel.subscription.gift',
	'channel.subscription.message',
	'channel.cheer',
	'channel.ban',
	'channel.unban',
	'channel.moderator.add',
	'channel.moderator.remove',
	'channel.vip.add',
	'channel.vip.remove',
];

// Channel events requiring moderator_user_id
const moderatorEventNames = [
	'channel.follow',
	'channel.moderate',
	'channel.unban_request.create',
	'channel.unban_request.resolve',
	'channel.warning.acknowledge',
	'channel.warning.send',
	'channel.shield_mode.begin',
	'channel.shield_mode.end',
	'channel.shoutout.create',
	'channel.shoutout.receive',
	'channel.guest_star_session.begin',
	'channel.guest_star_session.end',
	'channel.guest_star_guest.update',
	'channel.guest_star_settings.update',
	'channel.suspicious_user.update',
	'channel.suspicious_user.message',
];

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
		placeholder: 'e.g. 123456789 or username',
		description:
			'The moderator user ID or username. If a username is provided, it will be automatically converted to user ID. Leave empty to use broadcaster ID.',
	},
];

export const channelEventOptions = [
	{ name: 'Channel Ad Break Begin', value: 'channel.ad_break.begin' },
	{ name: 'Channel Ban', value: 'channel.ban' },
	{ name: 'Channel Bits Use', value: 'channel.bits.use' },
	{ name: 'Channel Cheer', value: 'channel.cheer' },
	{ name: 'Channel Follow', value: 'channel.follow' },
	{ name: 'Channel Guest Star Guest Update', value: 'channel.guest_star_guest.update' },
	{ name: 'Channel Guest Star Session Begin', value: 'channel.guest_star_session.begin' },
	{ name: 'Channel Guest Star Session End', value: 'channel.guest_star_session.end' },
	{ name: 'Channel Guest Star Settings Update', value: 'channel.guest_star_settings.update' },
	{ name: 'Channel Moderate', value: 'channel.moderate' },
	{ name: 'Channel Moderator Add', value: 'channel.moderator.add' },
	{ name: 'Channel Moderator Remove', value: 'channel.moderator.remove' },
	{ name: 'Channel Shield Mode Begin', value: 'channel.shield_mode.begin' },
	{ name: 'Channel Shield Mode End', value: 'channel.shield_mode.end' },
	{ name: 'Channel Shoutout Create', value: 'channel.shoutout.create' },
	{ name: 'Channel Shoutout Receive', value: 'channel.shoutout.receive' },
	{ name: 'Channel Subscribe', value: 'channel.subscribe' },
	{ name: 'Channel Subscription End', value: 'channel.subscription.end' },
	{ name: 'Channel Subscription Gift', value: 'channel.subscription.gift' },
	{ name: 'Channel Subscription Message', value: 'channel.subscription.message' },
	{ name: 'Channel Suspicious User Message', value: 'channel.suspicious_user.message' },
	{ name: 'Channel Suspicious User Update', value: 'channel.suspicious_user.update' },
	{ name: 'Channel Unban', value: 'channel.unban' },
	{ name: 'Channel Unban Request Create', value: 'channel.unban_request.create' },
	{ name: 'Channel Unban Request Resolve', value: 'channel.unban_request.resolve' },
	{ name: 'Channel Update', value: 'channel.update' },
	{ name: 'Channel VIP Add', value: 'channel.vip.add' },
	{ name: 'Channel VIP Remove', value: 'channel.vip.remove' },
	{ name: 'Channel Warning Acknowledge', value: 'channel.warning.acknowledge' },
	{ name: 'Channel Warning Send', value: 'channel.warning.send' },
];

export const channelEventFields: INodeProperties[] = [
	// Broadcaster-only events
	...updateDisplayOptions({ show: { event: broadcasterOnlyEventNames } }, broadcasterIdField),

	// Moderator events
	...updateDisplayOptions({ show: { event: moderatorEventNames } }, [
		...broadcasterIdField,
		...moderatorIdField,
	]),
];

export const CHANNEL_BROADCASTER_ONLY_EVENTS = broadcasterOnlyEventNames;
export const CHANNEL_MODERATOR_EVENTS = moderatorEventNames;

/**
 * Build condition object for channel events
 */
export const buildCondition: EventConditionBuilder = async (context, event) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrUsername.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;

	// Moderator events require moderator_user_id
	if (moderatorEventNames.includes(event)) {
		const moderatorIdInput = context.getNodeParameter('moderatorId', '') as string;
		if (moderatorIdInput && moderatorIdInput.trim() !== '') {
			condition.moderator_user_id = await resolveUserIdOrUsername.call(context, moderatorIdInput);
		} else {
			condition.moderator_user_id = broadcasterId;
		}
	}

	return condition;
};
