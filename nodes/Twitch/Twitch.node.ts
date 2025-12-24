import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

// Import all 37 resources (alphabetically)
import { adOperations, adFields } from './resources/Ad';
import { analyticsOperations, analyticsFields } from './resources/Analytics';
import { announcementOperations, announcementFields } from './resources/Announcement';
import { badgeOperations, badgeFields } from './resources/Badge';
import { banOperations, banFields } from './resources/Ban';
import { bitsLeaderboardOperations, bitsLeaderboardFields } from './resources/BitsLeaderboard';
import { channelOperations, channelFields } from './resources/Channel';
import { charityOperations, charityFields } from './resources/Charity';
import { chatMessageOperations, chatMessageFields } from './resources/ChatMessage';
import { chatSettingsOperations, chatSettingsFields } from './resources/ChatSettings';
import { chatterOperations, chatterFields } from './resources/Chatter';
import { cheermoteOperations, cheermoteFields } from './resources/Cheermote';
import { clipOperations, clipFields } from './resources/Clip';
import { customRewardOperations, customRewardFields } from './resources/CustomReward';
import { emoteOperations, emoteFields } from './resources/Emote';
import { gameOperations, gameFields } from './resources/Game';
import { goalOperations, goalFields } from './resources/Goal';
import { hypeTrainOperations, hypeTrainFields } from './resources/HypeTrain';
import { moderationOperations, moderationFields } from './resources/Moderation';
import { moderatorOperations, moderatorFields } from './resources/Moderator';
import { pollOperations, pollFields } from './resources/Poll';
import { predictionOperations, predictionFields } from './resources/Prediction';
import { raidOperations, raidFields } from './resources/Raid';
import { redemptionOperations, redemptionFields } from './resources/Redemption';
import { scheduleOperations, scheduleFields } from './resources/Schedule';
import { searchOperations, searchFields } from './resources/Search';
import { shoutoutOperations, shoutoutFields } from './resources/Shoutout';
import { streamOperations, streamFields } from './resources/Stream';
import { subscriptionOperations, subscriptionFields } from './resources/Subscription';
import { teamOperations, teamFields } from './resources/Team';
import { userOperations, userFields } from './resources/User';
import { videoOperations, videoFields } from './resources/Video';
import { vipOperations, vipFields } from './resources/VIP';
import { whisperOperations, whisperFields } from './resources/Whisper';

export class Twitch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch',
		name: 'twitch',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Twitch API - users, channels, streams, clips, moderation, and more',
		defaults: {
			name: 'Twitch',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.twitch.tv/helix',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Ad', value: 'ad' },
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Announcement', value: 'announcement' },
					{ name: 'Badge', value: 'badge' },
					{ name: 'Ban', value: 'ban' },
					{ name: 'Bits Leaderboard', value: 'bitsLeaderboard' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'Charity', value: 'charity' },
					{ name: 'Chat Message', value: 'chatMessage' },
					{ name: 'Chat Setting', value: 'chatSettings' },
					{ name: 'Chatter', value: 'chatter' },
					{ name: 'Cheermote', value: 'cheermote' },
					{ name: 'Clip', value: 'clip' },
					{ name: 'Custom Reward', value: 'customReward' },
					{ name: 'Emote', value: 'emote' },
					{ name: 'Game', value: 'game' },
					{ name: 'Goal', value: 'goal' },
					{ name: 'Hype Train', value: 'hypeTrain' },
					{ name: 'Moderation', value: 'moderation' },
					{ name: 'Moderator', value: 'moderator' },
					{ name: 'Poll', value: 'poll' },
					{ name: 'Prediction', value: 'prediction' },
					{ name: 'Raid', value: 'raid' },
					{ name: 'Redemption', value: 'redemption' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Search', value: 'search' },
					{ name: 'Shoutout', value: 'shoutout' },
					{ name: 'Stream', value: 'stream' },
					{ name: 'Subscription', value: 'subscription' },
					{ name: 'Team', value: 'team' },
					{ name: 'User', value: 'user' },
					{ name: 'Video', value: 'video' },
					{ name: 'VIP', value: 'vip' },
					{ name: 'Whisper', value: 'whisper' },
				],
				default: 'user',
			},

			// Operations (spread all 37)
			...adOperations,
			...analyticsOperations,
			...announcementOperations,
			...badgeOperations,
			...banOperations,
			...bitsLeaderboardOperations,
			...channelOperations,
			...charityOperations,
			...chatMessageOperations,
			...chatSettingsOperations,
			...chatterOperations,
			...cheermoteOperations,
			...clipOperations,
			...customRewardOperations,
			...emoteOperations,
			...gameOperations,
			...goalOperations,
			...hypeTrainOperations,
			...moderationOperations,
			...moderatorOperations,
			...pollOperations,
			...predictionOperations,
			...raidOperations,
			...redemptionOperations,
			...scheduleOperations,
			...searchOperations,
			...shoutoutOperations,
			...streamOperations,
			...subscriptionOperations,
			...teamOperations,
			...userOperations,
			...videoOperations,
			...vipOperations,
			...whisperOperations,

			// Fields (spread all 37)
			...adFields,
			...analyticsFields,
			...announcementFields,
			...badgeFields,
			...banFields,
			...bitsLeaderboardFields,
			...channelFields,
			...charityFields,
			...chatMessageFields,
			...chatSettingsFields,
			...chatterFields,
			...cheermoteFields,
			...clipFields,
			...customRewardFields,
			...emoteFields,
			...gameFields,
			...goalFields,
			...hypeTrainFields,
			...moderationFields,
			...moderatorFields,
			...pollFields,
			...predictionFields,
			...raidFields,
			...redemptionFields,
			...scheduleFields,
			...searchFields,
			...shoutoutFields,
			...streamFields,
			...subscriptionFields,
			...teamFields,
			...userFields,
			...videoFields,
			...vipFields,
			...whisperFields,
		],
	};
}
