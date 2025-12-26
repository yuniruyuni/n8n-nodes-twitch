import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getInfoFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID. You may specify multiple IDs separated by commas (up to 100).',
	},
];

const updateInfoFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID. This ID must match the user ID in the user access token.',
	},
	{
		displayName: 'Game',
		name: 'gameId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 509670',
		description: 'Game ID. ID of the game that the user plays. Use "0" or empty string to unset.',
	},
	{
		displayName: 'Broadcaster Language',
		name: 'broadcasterLanguage',
		type: 'string',
		default: '',
		placeholder: 'e.g. en',
		description: 'The user\'s preferred language. Set the value to an ISO 639-1 two-letter language code. Set to "other" if the language is not a Twitch supported language.',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		placeholder: 'e.g. Playing Fortnite!',
		description: 'The title of the user\'s stream. You may not set this field to an empty string.',
	},
	{
		displayName: 'Delay',
		name: 'delay',
		type: 'number',
		default: 0,
		description: 'The number of seconds to buffer the broadcast before streaming it live (0-900). Only users with Partner status may set this field. Maximum delay is 900 seconds (15 minutes).',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		default: '',
		placeholder: 'e.g. DevsInTheKnow, LevelingUp',
		description: 'A comma-separated list of channel-defined tags (up to 10 tags, max 25 characters each). Tags help identify the content that the channel streams. Leave empty to remove all tags.',
	},
	{
		displayName: 'Content Classification Labels',
		name: 'contentClassificationLabels',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Label',
		description: 'List of Content Classification Labels (CCLs) to set for the channel',
		options: [
			{
				name: 'labels',
				displayName: 'Label',
				values: [
					{
						displayName: 'Label',
						name: 'id',
						type: 'options',
						default: 'DrugsIntoxication',
						options: [
							{
								name: 'Debated Social Issues and Politics',
								value: 'DebatedSocialIssuesAndPolitics',
							},
							{
								name: 'Drugs/Intoxication',
								value: 'DrugsIntoxication',
							},
							{
								name: 'Gambling',
								value: 'Gambling',
							},
							{
								name: 'Profanity/Vulgarity',
								value: 'ProfanityVulgarity',
							},
							{
								name: 'Sexual Themes',
								value: 'SexualThemes',
							},
							{
								name: 'Violent/Graphic',
								value: 'ViolentGraphic',
							},
						],
						description: 'The Content Classification Label to add or remove',
					},
					{
						displayName: 'Is Enabled',
						name: 'is_enabled',
						type: 'boolean',
						default: true,
						description: 'Whether the label should be enabled (true) or disabled (false) for the channel',
					},
				],
			},
		],
	},
	{
		displayName: 'Is Branded Content',
		name: 'isBrandedContent',
		type: 'boolean',
		default: false,
		description: 'Whether the channel has branded content',
	},
];

const getFollowersFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID. Returns the list of users that follow this broadcaster.',
	},
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'User ID or login name. If a login name is provided, it will be automatically converted to user ID. Use this parameter to see whether the user follows this broadcaster. If specified, the response contains this user if they follow the broadcaster.',
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

const getEditorsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID. This ID must match the user ID in the access token.',
	},
];

export const channelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['channel'],
			},
		},
		options: [
			{
				name: 'Get Information',
				value: 'getInfo',
				action: 'Get channel information',
				description: 'Get information about one or more channels',
				routing: {
					request: {
						method: 'GET',
						url: '/channels',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;

								// Support multiple IDs separated by commas
								const ids = broadcasterIdInput.split(',').map(id => id.trim());
								const resolvedIds = await Promise.all(
									ids.map(id => resolveUserIdOrLogin.call(this, id))
								);

								requestOptions.qs = {
									broadcaster_id: resolvedIds,
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
				name: 'Update Information',
				value: 'updateInfo',
				action: 'Update channel information',
				description: 'Update a channel\'s properties (requires user access token with channel:manage:broadcast scope)',
				routing: {
					request: {
						method: 'PATCH',
						url: '/channels',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
								};

								// Build request body with only specified fields
								const body: {
									game_id?: string;
									broadcaster_language?: string;
									title?: string;
									delay?: number;
									tags?: string[];
									content_classification_labels?: Array<{ id: string; is_enabled: boolean }>;
									is_branded_content?: boolean;
								} = {};

								const gameId = this.getNodeParameter('gameId', '') as string;
								if (gameId !== '') {
									body.game_id = gameId;
								}

								const broadcasterLanguage = this.getNodeParameter('broadcasterLanguage', '') as string;
								if (broadcasterLanguage !== '') {
									body.broadcaster_language = broadcasterLanguage;
								}

								const title = this.getNodeParameter('title', '') as string;
								if (title !== '') {
									body.title = title;
								}

								const delay = this.getNodeParameter('delay', 0) as number;
								if (delay > 0) {
									body.delay = delay;
								}

								const tagsInput = this.getNodeParameter('tags', '') as string;
								if (tagsInput !== '') {
									body.tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
								}

								const contentClassificationLabels = this.getNodeParameter('contentClassificationLabels', {}) as {
									labels?: Array<{ id: string; is_enabled: boolean }>;
								};
								if (contentClassificationLabels.labels && contentClassificationLabels.labels.length > 0) {
									body.content_classification_labels = contentClassificationLabels.labels;
								}

								const isBrandedContent = this.getNodeParameter('isBrandedContent', false) as boolean;
								if (isBrandedContent !== false) {
									body.is_branded_content = isBrandedContent;
								}

								requestOptions.body = body;

								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Get Followers',
				value: 'getFollowers',
				action: 'Get channel followers',
				description: 'Get a list of users that follow the specified broadcaster (requires moderator:read:followers scope)',
				routing: {
					request: {
						method: 'GET',
						url: '/channels/followers',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								const qs: {
									broadcaster_id: string;
									user_id?: string;
									first?: number;
									after?: string;
								} = {
									broadcaster_id: broadcasterId,
								};

								const userIdInput = this.getNodeParameter('userId', '') as string;
								if (userIdInput !== '') {
									const userId = await resolveUserIdOrLogin.call(this, userIdInput);
									qs.user_id = userId;
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
				name: 'Get Editors',
				value: 'getEditors',
				action: 'Get channel editors',
				description: 'Get the broadcaster\'s list of editors (requires channel:read:editors scope)',
				routing: {
					request: {
						method: 'GET',
						url: '/channels/editors',
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
		default: 'getInfo',
	},
];

export const channelFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['channel'], operation: ['getInfo'] } }, getInfoFields),
	...updateDisplayOptions({ show: { resource: ['channel'], operation: ['updateInfo'] } }, updateInfoFields),
	...updateDisplayOptions({ show: { resource: ['channel'], operation: ['getFollowers'] } }, getFollowersFields),
	...updateDisplayOptions({ show: { resource: ['channel'], operation: ['getEditors'] } }, getEditorsFields),
];
