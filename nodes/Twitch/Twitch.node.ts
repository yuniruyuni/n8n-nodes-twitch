import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

// Import all 24 resources (alphabetically)
import { announcementOperations, announcementFields } from './resources/Announcement';
import { banOperations, banFields } from './resources/Ban';
import { bitsLeaderboardOperations, bitsLeaderboardFields } from './resources/BitsLeaderboard';
import { channelOperations, channelFields } from './resources/Channel';
import { chatMessageOperations, chatMessageFields } from './resources/ChatMessage';
import { chatterOperations, chatterFields } from './resources/Chatter';
import { cheermoteOperations, cheermoteFields } from './resources/Cheermote';
import { clipOperations, clipFields } from './resources/Clip';
import { customRewardOperations, customRewardFields } from './resources/CustomReward';
import { emoteOperations, emoteFields } from './resources/Emote';
import { gameOperations, gameFields } from './resources/Game';
import { moderatorOperations, moderatorFields } from './resources/Moderator';
import { pollOperations, pollFields } from './resources/Poll';
import { predictionOperations, predictionFields } from './resources/Prediction';
import { raidOperations, raidFields } from './resources/Raid';
import { redemptionOperations, redemptionFields } from './resources/Redemption';
import { scheduleOperations, scheduleFields } from './resources/Schedule';
import { searchOperations, searchFields } from './resources/Search';
import { streamOperations, streamFields } from './resources/Stream';
import { subscriptionOperations, subscriptionFields } from './resources/Subscription';
import { teamOperations, teamFields } from './resources/Team';
import { userOperations, userFields } from './resources/User';
import { videoOperations, videoFields } from './resources/Video';
import { whisperOperations, whisperFields } from './resources/Whisper';
import { commonFields } from './resources/CommonFields';

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
					{ name: 'Announcement', value: 'announcement' },
					{ name: 'Ban', value: 'ban' },
					{ name: 'Bits Leaderboard', value: 'bitsLeaderboard' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'Chat Message', value: 'chatMessage' },
					{ name: 'Chatter', value: 'chatter' },
					{ name: 'Cheermote', value: 'cheermote' },
					{ name: 'Clip', value: 'clip' },
					{ name: 'Custom Reward', value: 'customReward' },
					{ name: 'Emote', value: 'emote' },
					{ name: 'Game', value: 'game' },
					{ name: 'Moderator', value: 'moderator' },
					{ name: 'Poll', value: 'poll' },
					{ name: 'Prediction', value: 'prediction' },
					{ name: 'Raid', value: 'raid' },
					{ name: 'Redemption', value: 'redemption' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Search', value: 'search' },
					{ name: 'Stream', value: 'stream' },
					{ name: 'Subscription', value: 'subscription' },
					{ name: 'Team', value: 'team' },
					{ name: 'User', value: 'user' },
					{ name: 'Video', value: 'video' },
					{ name: 'Whisper', value: 'whisper' },
				],
				default: 'user',
			},

			// Operations (spread all 24)
			...announcementOperations,
			...banOperations,
			...bitsLeaderboardOperations,
			...channelOperations,
			...chatMessageOperations,
			...chatterOperations,
			...cheermoteOperations,
			...clipOperations,
			...customRewardOperations,
			...emoteOperations,
			...gameOperations,
			...moderatorOperations,
			...pollOperations,
			...predictionOperations,
			...raidOperations,
			...redemptionOperations,
			...scheduleOperations,
			...searchOperations,
			...streamOperations,
			...subscriptionOperations,
			...teamOperations,
			...userOperations,
			...videoOperations,
			...whisperOperations,

			// Fields (spread all 24)
			...announcementFields,
			...banFields,
			...bitsLeaderboardFields,
			...channelFields,
			...chatMessageFields,
			...chatterFields,
			...cheermoteFields,
			...clipFields,
			...customRewardFields,
			...emoteFields,
			...gameFields,
			...moderatorFields,
			...pollFields,
			...predictionFields,
			...raidFields,
			...redemptionFields,
			...scheduleFields,
			...searchFields,
			...streamFields,
			...subscriptionFields,
			...teamFields,
			...userFields,
			...videoFields,
			...whisperFields,

			// Common fields (must be last to handle duplicate parameters)
			...commonFields,
		],
	};
}
