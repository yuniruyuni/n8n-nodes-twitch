import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { allOperations, allFields } from './resources';

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
				name: 'twitchUserOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.twitch.tv/helix',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Client-ID': '={{$credentials.clientId}}',
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

			// Operations
			...allOperations,

			// Fields
			...allFields,
		],
	};
}

