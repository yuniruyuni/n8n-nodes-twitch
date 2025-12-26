import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation

// Get Streams - all parameters are optional
const getStreamsFields: INodeProperties[] = [
	{
		displayName: 'Filter By',
		name: 'filterBy',
		type: 'options',
		default: 'userLogin',
		options: [
			{
				name: 'User Login',
				value: 'userLogin',
			},
			{
				name: 'User ID',
				value: 'userId',
			},
			{
				name: 'Game ID',
				value: 'gameId',
			},
			{
				name: 'None (Get All)',
				value: 'none',
			},
		],
		description: 'How to filter the list of streams',
	},
	{
		displayName: 'User Logins',
		name: 'userLogins',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				filterBy: ['userLogin'],
			},
		},
		placeholder: 'e.g. username1,username2',
		description: 'User login names to filter by (comma-separated, max 100)',
	},
	{
		displayName: 'Users',
		name: 'userIds',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				filterBy: ['userId'],
			},
		},
		placeholder: 'e.g. 123456,789012',
		description: 'User IDs to filter by (comma-separated, max 100)',
	},
	{
		displayName: 'Games',
		name: 'gameIds',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				filterBy: ['gameId'],
			},
		},
		placeholder: 'e.g. 493057,509658',
		description: 'Game/category IDs to filter by (comma-separated, max 100)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'Cursor for forward pagination',
			},
			{
				displayName: 'Before',
				name: 'before',
				type: 'string',
				default: '',
				description: 'Cursor for backward pagination',
			},
			{
				displayName: 'Languages',
				name: 'languages',
				type: 'string',
				default: '',
				placeholder: 'e.g. en,es,de',
				description: 'Language codes to filter by (comma-separated, max 100)',
			},
			{
				displayName: 'Limit',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of items to return (1-100)',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'all',
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Live',
						value: 'live',
					},
				],
				description: 'Type of stream to filter by',
			},
		],
	},
];

// Get Followed Streams
const getFollowedStreamsFields: INodeProperties[] = [
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764 or torpedo09',
		description: 'User ID or login name whose followed streams to get. If a login name is provided, it will be automatically converted to user ID. This must match the user ID in the access token.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'Cursor for forward pagination',
			},
			{
				displayName: 'Limit',
				name: 'first',
				type: 'number',
				default: 100,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of items to return (1-100)',
			},
		],
	},
];

// Get Stream Key
const getStreamKeyFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764 or torpedo09',
		description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID. This must match the user ID in the access token.',
	},
];

// Create Stream Marker
const createMarkerFields: INodeProperties[] = [
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123 or torpedo09',
		description: 'User ID or login name of the broadcaster streaming content. If a login name is provided, it will be automatically converted to user ID. This must match the user ID in the access token or be an editor.',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		placeholder: 'e.g. Important moment',
		description: 'Short description of the marker (max 140 characters)',
		typeOptions: {
			maxLength: 140,
		},
	},
];

// Get Stream Markers
const getMarkersFields: INodeProperties[] = [
	{
		displayName: 'Filter By',
		name: 'filterBy',
		type: 'options',
		default: 'userId',
		required: true,
		options: [
			{
				name: 'User ID',
				value: 'userId',
			},
			{
				name: 'Video ID',
				value: 'videoId',
			},
		],
		description: 'Get markers by user (most recent stream) or specific video',
	},
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				filterBy: ['userId'],
			},
		},
		required: true,
		placeholder: 'e.g. 123 or torpedo09',
		description: 'User ID or login name to get markers from their most recent stream. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Video',
		name: 'videoId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				filterBy: ['videoId'],
			},
		},
		required: true,
		placeholder: 'e.g. 456',
		description: 'Video ID to get markers from',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'Cursor for forward pagination',
			},
			{
				displayName: 'Before',
				name: 'before',
				type: 'string',
				default: '',
				description: 'Cursor for backward pagination',
			},
			{
				displayName: 'Limit',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of items to return (1-100)',
			},
		],
	},
];

export const streamOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['stream'],
			},
		},
		options: [
			{
				name: 'Get Streams',
				value: 'getStreams',
				action: 'Get list of streams',
				description: 'Get list of live streams (sorted by viewer count)',
				routing: {
					request: {
						method: 'GET',
						url: '/streams',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const filterBy = this.getNodeParameter('filterBy', 0) as string;
								const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

								requestOptions.qs = requestOptions.qs || {};

								// Handle filter parameters
								if (filterBy === 'userLogin') {
									const userLogins = this.getNodeParameter('userLogins', 0) as string;
									if (userLogins) {
										const logins = userLogins.split(',').map((s) => s.trim()).filter(Boolean);
										if (logins.length === 1) {
											requestOptions.qs.user_login = logins[0];
										} else {
											requestOptions.qs.user_login = logins;
										}
									}
								} else if (filterBy === 'userId') {
									const userIds = this.getNodeParameter('userIds', 0) as string;
									if (userIds) {
										const ids = userIds.split(',').map((s) => s.trim()).filter(Boolean);
										if (ids.length === 1) {
											requestOptions.qs.user_id = ids[0];
										} else {
											requestOptions.qs.user_id = ids;
										}
									}
								} else if (filterBy === 'gameId') {
									const gameIds = this.getNodeParameter('gameIds', 0) as string;
									if (gameIds) {
										const ids = gameIds.split(',').map((s) => s.trim()).filter(Boolean);
										if (ids.length === 1) {
											requestOptions.qs.game_id = ids[0];
										} else {
											requestOptions.qs.game_id = ids;
										}
									}
								}

								// Handle additional fields
								if (additionalFields.type) {
									requestOptions.qs.type = additionalFields.type as string;
								}
								if (additionalFields.languages) {
									const languages = (additionalFields.languages as string).split(',').map((s: string) => s.trim()).filter(Boolean);
									if (languages.length === 1) {
										requestOptions.qs.language = languages[0];
									} else {
										requestOptions.qs.language = languages;
									}
								}
								if (additionalFields.first) {
									requestOptions.qs.first = additionalFields.first as number;
								}
								if (additionalFields.after) {
									requestOptions.qs.after = additionalFields.after as string;
								}
								if (additionalFields.before) {
									requestOptions.qs.before = additionalFields.before as string;
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
				name: 'Get Followed Streams',
				value: 'getFollowedStreams',
				action: 'Get followed streams',
				description: 'Get list of live streams from broadcasters the user follows',
				routing: {
					request: {
						method: 'GET',
						url: '/streams/followed',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdInput = this.getNodeParameter('userId', 0) as string;
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);
								const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

								requestOptions.qs = requestOptions.qs || {};
								requestOptions.qs.user_id = userId;

								if (additionalFields.first) {
									requestOptions.qs.first = additionalFields.first as number;
								}
								if (additionalFields.after) {
									requestOptions.qs.after = additionalFields.after as string;
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
				name: 'Get Stream Key',
				value: 'getStreamKey',
				action: 'Get stream key',
				description: 'Get the channel\'s stream key',
				routing: {
					request: {
						method: 'GET',
						url: '/streams/key',
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
				name: 'Create Stream Marker',
				value: 'createMarker',
				action: 'Create a stream marker',
				description: 'Add a marker to a live stream',
				routing: {
					request: {
						method: 'POST',
						url: '/streams/markers',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdInput = this.getNodeParameter('userId', 0) as string;
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);
								const description = this.getNodeParameter('description', 0) as string;

								const body: { user_id: string; description?: string } = { user_id: userId };
								if (description) {
									body.description = description;
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
				name: 'Get Stream Markers',
				value: 'getMarkers',
				action: 'Get stream markers',
				description: 'Get markers from a stream or video',
				routing: {
					request: {
						method: 'GET',
						url: '/streams/markers',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const filterBy = this.getNodeParameter('filterBy', 0) as string;
								const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

								requestOptions.qs = requestOptions.qs || {};

								if (filterBy === 'userId') {
									const userIdInput = this.getNodeParameter('userId', 0) as string;
									const userId = await resolveUserIdOrLogin.call(this, userIdInput);
									requestOptions.qs.user_id = userId;
								} else if (filterBy === 'videoId') {
									const videoId = this.getNodeParameter('videoId', 0) as string;
									requestOptions.qs.video_id = videoId;
								}

								if (additionalFields.first) {
									requestOptions.qs.first = additionalFields.first as number;
								}
								if (additionalFields.after) {
									requestOptions.qs.after = additionalFields.after as string;
								}
								if (additionalFields.before) {
									requestOptions.qs.before = additionalFields.before as string;
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
		default: 'getStreams',
	},
];

export const streamFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['stream'], operation: ['getStreams'] } }, getStreamsFields),
	...updateDisplayOptions({ show: { resource: ['stream'], operation: ['getFollowedStreams'] } }, getFollowedStreamsFields),
	...updateDisplayOptions({ show: { resource: ['stream'], operation: ['getStreamKey'] } }, getStreamKeyFields),
	...updateDisplayOptions({ show: { resource: ['stream'], operation: ['createMarker'] } }, createMarkerFields),
	...updateDisplayOptions({ show: { resource: ['stream'], operation: ['getMarkers'] } }, getMarkersFields),
];
