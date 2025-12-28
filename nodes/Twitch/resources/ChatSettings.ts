/**
 * Chat Settings Resource
 *
 * Operations for Twitch Chat Settings API endpoints:
 * - Get Chat Settings
 * - Update Chat Settings
 * - Get User Chat Color
 * - Update User Chat Color
 * - Get Shared Chat Session
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-chat-settings
 */

import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const getChatSettingsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The ID of the broadcaster whose chat settings you want to get',
	},
	{
		displayName: 'Moderator',
		name: 'moderatorId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The User ID or login name of the broadcaster or one of the broadcaster\'s moderators. If a login name is provided, it will be automatically converted to user ID. Required only if you want to include the non_moderator_chat_delay and non_moderator_chat_delay_duration settings in the response. This ID must match the user ID in the user access token.',
	},
];

const updateChatSettingsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The ID of the broadcaster whose chat settings you want to update',
	},
	{
		displayName: 'Moderator',
		name: 'moderatorId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The User ID or login name of a user that has permission to moderate the broadcaster\'s chat room, or the broadcaster\'s ID/username if they\'re making the update. If a login name is provided, it will be automatically converted to user ID. This ID must match the user ID in the user access token.',
	},
	{
		displayName: 'Emote Mode',
		name: 'emoteMode',
		type: 'boolean',
		default: false,
		description: 'Whether chat messages must contain only emotes',
	},
	{
		displayName: 'Follower Mode',
		name: 'followerMode',
		type: 'boolean',
		default: false,
		description: 'Whether the broadcaster restricts the chat room to followers only',
	},
	{
		displayName: 'Follower Mode Duration',
		name: 'followerModeDuration',
		type: 'number',
		default: 0,
		description: 'The length of time, in minutes, that users must follow the broadcaster before being able to participate in the chat room (0-129600). Set only if follower_mode is true.',
		typeOptions: {
			minValue: 0,
			maxValue: 129600,
		},
	},
	{
		displayName: 'Non-Moderator Chat Delay',
		name: 'nonModeratorChatDelay',
		type: 'boolean',
		default: false,
		description: 'Whether the broadcaster adds a short delay before chat messages appear in the chat room',
	},
	{
		displayName: 'Non-Moderator Chat Delay Duration',
		name: 'nonModeratorChatDelayDuration',
		type: 'options',
		default: 2,
		options: [
			{
				name: '2 Seconds (Recommended)',
				value: 2,
			},
			{
				name: '4 Seconds',
				value: 4,
			},
			{
				name: '6 Seconds',
				value: 6,
			},
		],
		description: 'The amount of time, in seconds, that messages are delayed before appearing in chat. Set only if non_moderator_chat_delay is true.',
	},
	{
		displayName: 'Slow Mode',
		name: 'slowMode',
		type: 'boolean',
		default: false,
		description: 'Whether the broadcaster limits how often users in the chat room are allowed to send messages',
	},
	{
		displayName: 'Slow Mode Wait Time',
		name: 'slowModeWaitTime',
		type: 'number',
		default: 30,
		description: 'The amount of time, in seconds, that users must wait between sending messages (3-120). Set only if slow_mode is true.',
		typeOptions: {
			minValue: 3,
			maxValue: 120,
		},
	},
	{
		displayName: 'Subscriber Mode',
		name: 'subscriberMode',
		type: 'boolean',
		default: false,
		description: 'Whether only users that subscribe to the broadcaster\'s channel may talk in the chat room',
	},
	{
		displayName: 'Unique Chat Mode',
		name: 'uniqueChatMode',
		type: 'boolean',
		default: false,
		description: 'Whether the broadcaster requires users to post only unique messages in the chat room',
	},
];

const getUserChatColorFields: INodeProperties[] = [
	{
		displayName: 'User IDs or Usernames',
		name: 'userIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789,987654321 or user1,user2',
		description: 'The ID(s) or username(s) of the user(s) whose username color you want to get. If usernames are provided, they will be automatically converted to user IDs. To specify multiple users, separate with commas (up to 100 users).',
	},
];

const updateUserChatColorFields: INodeProperties[] = [
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The User ID or login name of the user whose chat color you want to update. If a login name is provided, it will be automatically converted to user ID. This ID must match the user ID in the access token.',
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'options',
		default: 'blue',
		options: [
			{ name: 'Blue', value: 'blue' },
			{ name: 'Blue Violet', value: 'blue_violet' },
			{ name: 'Cadet Blue', value: 'cadet_blue' },
			{ name: 'Chocolate', value: 'chocolate' },
			{ name: 'Coral', value: 'coral' },
			{ name: 'Custom Hex Color', value: 'custom' },
			{ name: 'Dodger Blue', value: 'dodger_blue' },
			{ name: 'Firebrick', value: 'firebrick' },
			{ name: 'Golden Rod', value: 'golden_rod' },
			{ name: 'Green', value: 'green' },
			{ name: 'Hot Pink', value: 'hot_pink' },
			{ name: 'Orange Red', value: 'orange_red' },
			{ name: 'Red', value: 'red' },
			{ name: 'Sea Green', value: 'sea_green' },
			{ name: 'Spring Green', value: 'spring_green' },
			{ name: 'Yellow Green', value: 'yellow_green' },
		],
		description: 'The color to use for the user\'s name in chat. Turbo and Prime users may also specify a custom Hex color code.',
	},
	{
		displayName: 'Custom Color (Hex)',
		name: 'customColor',
		type: 'color',
		default: '',
		placeholder: 'e.g. #9146FF',
		displayOptions: {
			show: {
				color: ['custom'],
			},
		},
		description: 'A Hex color code (e.g., #9146FF). Only available for Turbo and Prime users.',
	},
];

const getSharedChatSessionFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The User ID of the channel broadcaster',
	},
];

export const chatSettingsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chatSettings'],
			},
		},
		options: [
			{
				name: 'Get Chat Settings',
				value: 'getChatSettings',
				action: 'Get chat settings',
				description: 'Get the broadcaster\'s chat settings',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/settings',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								const qs: {
									broadcaster_id: string;
									moderator_id?: string;
								} = {
									broadcaster_id: broadcasterId,
								};

								const moderatorIdInput = this.getNodeParameter('moderatorId', '') as string;
								if (moderatorIdInput !== '') {
									const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);
									qs.moderator_id = moderatorId;
								}

								requestOptions.qs = qs;

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
				name: 'Update Chat Settings',
				value: 'updateChatSettings',
				action: 'Update chat settings',
				description: 'Update the broadcaster\'s chat settings (requires moderator:manage:chat_settings scope)',
				routing: {
					request: {
						method: 'PATCH',
						url: '/chat/settings',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								// Build request body with only specified fields
								const body: {
									emote_mode?: boolean;
									follower_mode?: boolean;
									follower_mode_duration?: number;
									non_moderator_chat_delay?: boolean;
									non_moderator_chat_delay_duration?: number;
									slow_mode?: boolean;
									slow_mode_wait_time?: number;
									subscriber_mode?: boolean;
									unique_chat_mode?: boolean;
								} = {};

								const emoteMode = this.getNodeParameter('emoteMode', false) as boolean;
								if (emoteMode !== false) {
									body.emote_mode = emoteMode;
								}

								const followerMode = this.getNodeParameter('followerMode', false) as boolean;
								if (followerMode !== false) {
									body.follower_mode = followerMode;
								}

								const followerModeDuration = this.getNodeParameter('followerModeDuration', 0) as number;
								if (followerModeDuration !== 0) {
									body.follower_mode_duration = followerModeDuration;
								}

								const nonModeratorChatDelay = this.getNodeParameter('nonModeratorChatDelay', false) as boolean;
								if (nonModeratorChatDelay !== false) {
									body.non_moderator_chat_delay = nonModeratorChatDelay;
								}

								const nonModeratorChatDelayDuration = this.getNodeParameter('nonModeratorChatDelayDuration', 2) as number;
								if (nonModeratorChatDelayDuration !== 2) {
									body.non_moderator_chat_delay_duration = nonModeratorChatDelayDuration;
								}

								const slowMode = this.getNodeParameter('slowMode', false) as boolean;
								if (slowMode !== false) {
									body.slow_mode = slowMode;
								}

								const slowModeWaitTime = this.getNodeParameter('slowModeWaitTime', 30) as number;
								if (slowModeWaitTime !== 30) {
									body.slow_mode_wait_time = slowModeWaitTime;
								}

								const subscriberMode = this.getNodeParameter('subscriberMode', false) as boolean;
								if (subscriberMode !== false) {
									body.subscriber_mode = subscriberMode;
								}

								const uniqueChatMode = this.getNodeParameter('uniqueChatMode', false) as boolean;
								if (uniqueChatMode !== false) {
									body.unique_chat_mode = uniqueChatMode;
								}

								requestOptions.body = body;

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
				name: 'Get User Chat Color',
				value: 'getUserChatColor',
				action: 'Get user chat color',
				description: 'Get the color used for the user\'s name in chat',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/color',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdsInput = this.getNodeParameter('userIds') as string;

								// Support multiple IDs or usernames separated by commas
								const inputs = userIdsInput.split(',').map(id => id.trim());
								const ids = await Promise.all(
									inputs.map(input => resolveUserIdOrLogin.call(this, input))
								);

								requestOptions.qs = {
									user_id: ids,
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
				name: 'Update User Chat Color',
				value: 'updateUserChatColor',
				action: 'Update user chat color',
				description: 'Update the color used for the user\'s name in chat (requires user:manage:chat_color scope)',
				routing: {
					request: {
						method: 'PUT',
						url: '/chat/color',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdInput = this.getNodeParameter('userId') as string;
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);
								const colorOption = this.getNodeParameter('color') as string;

								let color = colorOption;
								if (colorOption === 'custom') {
									const customColor = this.getNodeParameter('customColor', '') as string;
									// URL encode the hex color (e.g., #9146FF -> %239146FF)
									color = encodeURIComponent(customColor);
								}

								requestOptions.qs = {
									user_id: userId,
									color: color,
								};

								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Get Shared Chat Session',
				value: 'getSharedChatSession',
				action: 'Get shared chat session',
				description: 'Retrieve the active shared chat session for a channel',
				routing: {
					request: {
						method: 'GET',
						url: '/shared_chat/session',
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
		],
		default: 'getChatSettings',
	},
];

export const chatSettingsFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['chatSettings'], operation: ['getChatSettings'] } }, getChatSettingsFields),
	...updateDisplayOptions({ show: { resource: ['chatSettings'], operation: ['updateChatSettings'] } }, updateChatSettingsFields),
	...updateDisplayOptions({ show: { resource: ['chatSettings'], operation: ['getUserChatColor'] } }, getUserChatColorFields),
	...updateDisplayOptions({ show: { resource: ['chatSettings'], operation: ['updateUserChatColor'] } }, updateUserChatColorFields),
	...updateDisplayOptions({ show: { resource: ['chatSettings'], operation: ['getSharedChatSession'] } }, getSharedChatSessionFields),
];
