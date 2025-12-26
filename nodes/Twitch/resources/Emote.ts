import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';

export const emoteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['emote'],
			},
		},
		options: [
			{
				name: 'Get Channel Emotes',
				value: 'getChannelEmotes',
				action: 'Get channel emotes',
				description: 'Get emotes for a specific Twitch channel',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/emotes',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								requestOptions.qs = {
									broadcaster_id: broadcasterId,
								};
								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Emote Sets',
				value: 'getEmoteSets',
				action: 'Get emote sets',
				description: 'Get emotes for one or more specified emote sets',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/emotes/set',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const emoteSetIds = this.getNodeParameter('emoteSetIds') as string;
								const idsArray = emoteSetIds.split(',').map((id) => id.trim());
								requestOptions.qs = {
									emote_set_id: idsArray,
								};
								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Global Emotes',
				value: 'getGlobalEmotes',
				action: 'Get global emotes',
				description: 'Get the list of global emotes',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/emotes/global',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get User Emotes',
				value: 'getUserEmotes',
				action: 'Get user emotes',
				description: 'Get emotes available to the user across all channels',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/emotes/user',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdInput = this.getNodeParameter('userId') as string;
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);
								requestOptions.qs = {
									user_id: userId,
								};

								// Add optional parameters
								const additionalFields = this.getNodeParameter('additionalFields', {}) as {
									after?: string;
									broadcasterId?: string;
								};

								if (additionalFields.after) {
									requestOptions.qs.after = additionalFields.after;
								}

								if (additionalFields.broadcasterId) {
									const broadcasterId = await resolveUserIdOrLogin.call(
										this,
										additionalFields.broadcasterId,
									);
									requestOptions.qs.broadcaster_id = broadcasterId;
								}

								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getChannelEmotes',
	},
];

export const emoteFields: INodeProperties[] = [
	// Get Channel Emotes fields
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['emote'],
				operation: ['getChannelEmotes'],
			},
		},
		default: '',
		description: 'Broadcaster user ID or login name whose emotes you want to get',
	},

	// Get Emote Sets fields
	{
		displayName: 'Emote Sets',
		name: 'emoteSetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['emote'],
				operation: ['getEmoteSets'],
			},
		},
		default: '',
		description:
			'Comma-separated list of emote set IDs to get. Maximum of 25 IDs. Example: 1234,5678',
	},

	// Get User Emotes fields
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['emote'],
				operation: ['getUserEmotes'],
			},
		},
		default: '',
		description:
			'User ID or login name. This ID must match the user ID in the user access token. Requires user:read:emotes scope.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['emote'],
				operation: ['getUserEmotes'],
			},
		},
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'The cursor used to get the next page of results',
			},
			{
				displayName: 'Broadcaster',
				name: 'broadcasterId',
				type: 'string',
				default: '',
				description:
					'The User ID or login name of a broadcaster you wish to get follower emotes of. Using this will guarantee inclusion of the broadcaster\'s follower emotes.',
			},
		],
	},
];
