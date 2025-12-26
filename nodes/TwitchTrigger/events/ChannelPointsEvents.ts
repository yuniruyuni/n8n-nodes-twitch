import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';
import { resolveUserIdOrLogin } from '../../Twitch/shared/userIdConverter';
import type { EventConditionBuilder } from './types';

// Automatic reward redemption events (broadcaster_user_id only)
const automaticRewardRedemptionEventNames = [
	'channel.channel_points_automatic_reward_redemption.add',
];

// Custom reward management and redemption events (broadcaster_user_id + optional reward_id)
const customRewardEventNames = [
	'channel.channel_points_custom_reward.add',
	'channel.channel_points_custom_reward.update',
	'channel.channel_points_custom_reward.remove',
	'channel.channel_points_custom_reward_redemption.add',
	'channel.channel_points_custom_reward_redemption.update',
];

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

const rewardIdField: INodeProperties[] = [
	{
		displayName: 'Reward ID',
		name: 'rewardId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
		description: 'The channel points custom reward ID. Leave empty to monitor all rewards.',
	},
];

export const channelPointsEventOptions = [
	{
		name: 'Channel Points Automatic Reward Redemption Add',
		value: 'channel.channel_points_automatic_reward_redemption.add',
	},
	{ name: 'Channel Points Custom Reward Add', value: 'channel.channel_points_custom_reward.add' },
	{
		name: 'Channel Points Custom Reward Remove',
		value: 'channel.channel_points_custom_reward.remove',
	},
	{
		name: 'Channel Points Custom Reward Update',
		value: 'channel.channel_points_custom_reward.update',
	},
	{
		name: 'Channel Points Custom Reward Redemption Add',
		value: 'channel.channel_points_custom_reward_redemption.add',
	},
	{
		name: 'Channel Points Custom Reward Redemption Update',
		value: 'channel.channel_points_custom_reward_redemption.update',
	},
];

export const channelPointsEventFields: INodeProperties[] = [
	// Automatic reward redemption events (broadcaster only)
	...updateDisplayOptions(
		{ show: { event: automaticRewardRedemptionEventNames } },
		broadcasterIdField,
	),

	// Custom reward management and redemption events (broadcaster + optional reward)
	...updateDisplayOptions({ show: { event: customRewardEventNames } }, [
		...broadcasterIdField,
		...rewardIdField,
	]),
];

export const CHANNEL_POINTS_AUTOMATIC_EVENTS = automaticRewardRedemptionEventNames;
export const CHANNEL_POINTS_REWARD_EVENTS = customRewardEventNames;

/**
 * Build condition object for channel points events (broadcaster + optional reward_id)
 */
export const buildCondition: EventConditionBuilder = async (context, event) => {
	const condition: IDataObject = {};
	const broadcasterIdInput = context.getNodeParameter('broadcasterId') as string;
	const broadcasterId = await resolveUserIdOrLogin.call(context, broadcasterIdInput);
	condition.broadcaster_user_id = broadcasterId;

	// Custom reward events support optional reward_id
	if (customRewardEventNames.includes(event)) {
		const rewardId = context.getNodeParameter('rewardId', '') as string;
		if (rewardId && rewardId.trim() !== '') {
			condition.reward_id = rewardId;
		}
	}

	return condition;
};
