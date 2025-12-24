import type { INodeProperties } from 'n8n-workflow';

/**
 * Common fields used across multiple Twitch resources.
 * These fields are consolidated here to prevent parameter duplication issues
 * where n8n shows all parameters for all operations.
 */
export const commonFields: INodeProperties[] = [
	// Broadcaster ID - used in 24 different resource/operation combinations
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: [
					'announcement',
					'ban',
					'channel',
					'chatMessage',
					'chatter',
					'cheermote',
					'clip',
					'customReward',
					'emote',
					'moderator',
					'poll',
					'prediction',
					'raid',
					'redemption',
					'subscription',
					'team',
				],
				operation: [
					'send', // announcement
					'banUser', 'unbanUser', 'getBannedUsers', // ban
					'getInfo', // channel
					'sendMessage', // chatMessage
					'get', // chatter, cheermote, moderator
					'createClip', 'getClips', // clip (getClips also uses filterType)
					'create', 'update', 'delete', 'get', 'getAll', // customReward
					'getChannelEmotes', // emote
					'add', 'remove', // moderator
					'createPoll', // poll
					'createPrediction', // prediction
					'cancelRaid', // raid
					'get', 'updateRedemptionStatus', // redemption
					'get', // subscription
					'getChannelTeams', // team
				],
			},
			hide: {
				// Hide when resource is clip AND operation is getClips AND filterType is NOT broadcasterId
				resource: ['clip'],
				operation: ['getClips'],
				filterType: ['gameId', 'clipId'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},

	// Poll - separate broadcaster ID fields for different operations (different parameter names in Poll.ts)
	{
		displayName: 'Broadcaster ID or Username',
		name: 'getBroadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['poll'],
				operation: ['getPolls'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username whose polls to retrieve',
	},
	{
		displayName: 'Broadcaster ID or Username',
		name: 'endBroadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['poll'],
				operation: ['endPoll'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username who owns the poll',
	},

	// Prediction - separate broadcaster ID fields
	{
		displayName: 'Broadcaster ID or Username',
		name: 'getBroadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['prediction'],
				operation: ['getPredictions'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username whose predictions to retrieve',
	},
	{
		displayName: 'Broadcaster ID or Username',
		name: 'endBroadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['prediction'],
				operation: ['endPrediction'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username who owns the prediction',
	},

	// Schedule - different displayOptions structure
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['schedule'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},

	// Moderator ID - used in 4 resource/operation combinations
	{
		displayName: 'Moderator ID or Username',
		name: 'moderatorId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['announcement', 'ban', 'chatter'],
				operation: ['send', 'banUser', 'unbanUser', 'get'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 987654321 or username',
		description: 'The moderator user ID or username (must match the user access token). If a username is provided, it will be automatically converted to user ID.',
	},

	// User ID - used in 7 resource/operation combinations
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ban', 'bitsLeaderboard', 'moderator', 'subscription', 'video'],
				operation: ['banUser', 'unbanUser', 'get', 'add', 'remove', 'getVideos'],
			},
			hide: {
				// Hide for video when queryBy is not userId
				resource: ['video'],
				operation: ['getVideos'],
				queryBy: ['videoId', 'gameId'],
			},
		},
		default: '',
		placeholder: 'e.g. 123456789 or username',
		description: 'The user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},

	// Subscription - userId with different description
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['get'],
			},
		},
		default: '',
		placeholder: 'e.g. 123456789,987654321 or username1,username2',
		description: 'Filter by user IDs or usernames (comma-separated)',
	},

	// First (pagination) - used in 12 resource/operation combinations
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		displayOptions: {
			show: {
				resource: [
					'ban',
					'chatter',
					'clip',
					'game',
					'moderator',
					'poll',
					'prediction',
					'redemption',
					'schedule',
					'search',
					'subscription',
					'video',
				],
				operation: [
					'getBannedUsers', // ban
					'get', // chatter, moderator
					'getClips', // clip
					'getTopGames', // game
					'getPolls', // poll
					'getPredictions', // prediction
					'get', // redemption, subscription
					'getSchedule', // schedule
					'searchCategories', 'searchChannels', // search
					'getVideos', // video
				],
			},
			hide: {
				// Hide for clip when filterType is clipId (doesn't support pagination)
				resource: ['clip'],
				operation: ['getClips'],
				filterType: ['clipId'],
			},
		},
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'Maximum number of items to return',
	},

	// After (cursor pagination) - used in 4 resource/operation combinations
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['redemption', 'schedule', 'subscription', 'video'],
				operation: ['get', 'getSchedule', 'getVideos'],
			},
		},
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6NX19',
		description: 'Cursor for forward pagination',
	},
];
