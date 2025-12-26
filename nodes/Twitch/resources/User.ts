import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getFields: INodeProperties[] = [
	{
		displayName: 'Lookup By',
		name: 'lookupBy',
		type: 'options',
		options: [
			{
				name: 'User ID',
				value: 'id',
			},
			{
				name: 'User Login',
				value: 'login',
			},
		],
		default: 'login',
		description: 'Whether to look up user by ID or login name',
	},
	{
		displayName: 'User IDs',
		name: 'userIds',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				lookupBy: ['id'],
			},
		},
		placeholder: 'e.g. 141981764',
		description: 'User ID(s) to get. For multiple users, separate with commas. Maximum 100 IDs.',
	},
	{
		displayName: 'User Logins',
		name: 'userLogins',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				lookupBy: ['login'],
			},
		},
		placeholder: 'e.g. twitchdev',
		description: 'User login name(s) to get. For multiple users, separate with commas. Maximum 100 logins.',
	},
];

const updateFields: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		placeholder: 'Channel description',
		description: 'The string to update the channel\'s description to (maximum 300 characters). Leave empty to remove description.',
	},
];

const blockFields: INodeProperties[] = [
	{
		displayName: 'Target User ID',
		name: 'targetUserId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 198704263',
		description: 'The ID of the user to block',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Source Context',
				name: 'sourceContext',
				type: 'options',
				options: [
					{
						name: 'Chat',
						value: 'chat',
					},
					{
						name: 'Whisper',
						value: 'whisper',
					},
				],
				default: 'chat',
				description: 'The location where the harassment took place',
			},
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'options',
				options: [
					{
						name: 'Harassment',
						value: 'harassment',
					},
					{
						name: 'Spam',
						value: 'spam',
					},
					{
						name: 'Other',
						value: 'other',
					},
				],
				default: 'harassment',
				description: 'The reason for blocking the user',
			},
		],
	},
];

const unblockFields: INodeProperties[] = [
	{
		displayName: 'Target User ID',
		name: 'targetUserId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 198704263',
		description: 'The ID of the user to unblock',
	},
];

const getBlockListFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764',
		description: 'The ID of the broadcaster whose list of blocked users you want to get',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of items to return per page (1-100, default: 20)',
			},
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'Cursor for pagination',
			},
		],
	},
];

const getActiveExtensionsFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 141981764',
		description: 'The ID of the broadcaster whose active extensions you want to get. Optional if using user access token.',
	},
];

const updateExtensionsFields: INodeProperties[] = [
	{
		displayName: 'Extensions Data',
		name: 'extensionsData',
		type: 'json',
		default: '{\n  "data": {\n    "panel": {},\n    "overlay": {},\n    "component": {}\n  }\n}',
		required: true,
		description: 'Extensions configuration as JSON. See Twitch API documentation for structure.',
	},
];

const getAuthorizationFields: INodeProperties[] = [
	{
		displayName: 'User IDs',
		name: 'userIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764,197886470',
		description: 'User ID(s) to check authorization for. For multiple users, separate with commas. Maximum 10 IDs.',
	},
];

const getFollowedChannelsFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789',
		description: 'A user\'s ID. Returns the list of broadcasters that this user follows. This ID must match the user ID in the user OAuth token.',
	},
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456789 or username',
		description: 'A broadcaster\'s ID. Use this parameter to see whether the user follows this broadcaster.',
	},
	{
		displayName: 'Limit',
		name: 'first',
		type: 'number',
		default: 20,
		description: 'The maximum number of items to return per page (1-100). Default is 20.',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		description: 'The cursor used to get the next page of results',
	},
];

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Block',
				value: 'block',
				action: 'Block a user',
				description: 'Block a user from interacting with the broadcaster',
				routing: {
					request: {
						method: 'PUT',
						url: '/users/blocks',
						qs: {
							target_user_id: '={{$parameter.targetUserId}}',
							source_context: '={{$parameter.additionalFields?.sourceContext}}',
							reason: '={{$parameter.additionalFields?.reason}}',
						},
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get users',
				description: 'Get information about one or more users',
				routing: {
					request: {
						method: 'GET',
						url: '/users',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const lookupBy = this.getNodeParameter('lookupBy', 0) as string;
								const value = this.getNodeParameter(
									lookupBy === 'id' ? 'userIds' : 'userLogins',
									0,
								) as string;

								if (value) {
									const values = value.split(',').map((v) => v.trim());
									requestOptions.qs = requestOptions.qs || {};
									requestOptions.qs[lookupBy] = values;
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
			{
				name: 'Get Active Extensions',
				value: 'getActiveExtensions',
				action: 'Get active extensions',
				description: 'Get the active extensions that the broadcaster has installed',
				routing: {
					request: {
						method: 'GET',
						url: '/users/extensions',
						qs: {
							user_id: '={{$parameter.userId}}',
						},
					},
				},
			},
			{
				name: 'Get Authorization',
				value: 'getAuthorization',
				action: 'Get user authorization',
				description: 'Get the authorization scopes that users have granted',
				routing: {
					request: {
						method: 'GET',
						url: '/authorization/users',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIds = this.getNodeParameter('userIds', 0) as string;
								const ids = userIds.split(',').map((id) => id.trim());
								requestOptions.qs = requestOptions.qs || {};
								requestOptions.qs.user_id = ids;
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
				name: 'Get Block List',
				value: 'getBlockList',
				action: 'Get user block list',
				description: 'Get the list of users that the broadcaster has blocked',
				routing: {
					request: {
						method: 'GET',
						url: '/users/blocks',
						qs: {
							broadcaster_id: '={{$parameter.broadcasterId}}',
							first: '={{$parameter.additionalFields?.first}}',
							after: '={{$parameter.additionalFields?.after}}',
						},
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
				name: 'Get Extensions',
				value: 'getExtensions',
				action: 'Get user extensions',
				description: 'Get all extensions (active and inactive) that the broadcaster has installed',
				routing: {
					request: {
						method: 'GET',
						url: '/users/extensions/list',
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
				name: 'Get Followed Channels',
				value: 'getFollowedChannels',
				action: 'Get followed channels',
				description: 'Get a list of broadcasters that the specified user follows (requires user:read:follows scope)',
				routing: {
					request: {
						method: 'GET',
						url: '/channels/followed',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userId = this.getNodeParameter('userId') as string;

								const qs: {
									user_id: string;
									broadcaster_id?: string;
									first?: number;
									after?: string;
								} = {
									user_id: userId,
								};

								const broadcasterIdInput = this.getNodeParameter('broadcasterId', '') as string;
								if (broadcasterIdInput !== '') {
									const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
									qs.broadcaster_id = broadcasterId;
								}

								const first = this.getNodeParameter('first', 20) as number;
								if (first !== 20) {
									qs.first = first;
								}

								const after = this.getNodeParameter('after', '') as string;
								if (after !== '') {
									qs.after = after;
								}

								requestOptions.qs = qs;

								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Unblock',
				value: 'unblock',
				action: 'Unblock a user',
				description: 'Remove a user from the broadcaster\'s list of blocked users',
				routing: {
					request: {
						method: 'DELETE',
						url: '/users/blocks',
						qs: {
							target_user_id: '={{$parameter.targetUserId}}',
						},
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update user',
				description: 'Update the authenticated user\'s information',
				routing: {
					request: {
						method: 'PUT',
						url: '/users',
						qs: {
							description: '={{$parameter.description}}',
						},
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
				name: 'Update Extensions',
				value: 'updateExtensions',
				action: 'Update user extensions',
				description: 'Update an installed extension\'s information',
				routing: {
					request: {
						method: 'PUT',
						url: '/users/extensions',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const extensionsData = this.getNodeParameter('extensionsData', 0) as string;
								requestOptions.body = JSON.parse(extensionsData);
								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'get',
	},
];

export const userFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['user'], operation: ['get'] } }, getFields),
	...updateDisplayOptions({ show: { resource: ['user'], operation: ['update'] } }, updateFields),
	...updateDisplayOptions({ show: { resource: ['user'], operation: ['block'] } }, blockFields),
	...updateDisplayOptions({ show: { resource: ['user'], operation: ['unblock'] } }, unblockFields),
	...updateDisplayOptions(
		{ show: { resource: ['user'], operation: ['getBlockList'] } },
		getBlockListFields,
	),
	...updateDisplayOptions(
		{ show: { resource: ['user'], operation: ['getActiveExtensions'] } },
		getActiveExtensionsFields,
	),
	...updateDisplayOptions(
		{ show: { resource: ['user'], operation: ['updateExtensions'] } },
		updateExtensionsFields,
	),
	...updateDisplayOptions(
		{ show: { resource: ['user'], operation: ['getAuthorization'] } },
		getAuthorizationFields,
	),
	...updateDisplayOptions(
		{ show: { resource: ['user'], operation: ['getFollowedChannels'] } },
		getFollowedChannelsFields,
	),
];
