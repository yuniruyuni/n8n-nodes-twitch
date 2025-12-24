import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getVideosFields: INodeProperties[] = [
	{
		displayName: 'Query By',
		name: 'queryBy',
		type: 'options',
		options: [
			{
				name: 'User ID',
				value: 'userId',
				description: 'Get videos by user ID',
			},
			{
				name: 'Game ID',
				value: 'gameId',
				description: 'Get videos by game ID',
			},
			{
				name: 'Video ID',
				value: 'videoId',
				description: 'Get videos by video ID(s)',
			},
		],
		default: 'userId',
		required: true,
		description: 'How to query for videos (at least one required)',
	},
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				queryBy: ['userId'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		displayOptions: {
			show: {
				queryBy: ['gameId'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 493057',
		description: 'ID of the game the videos are of',
	},
	{
		displayName: 'Video IDs',
		name: 'videoIds',
		type: 'string',
		displayOptions: {
			show: {
				queryBy: ['videoId'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 234482848 or 234482848,234482850',
		description: 'ID(s) of the video(s). Separate multiple IDs with commas. Maximum 100 IDs.',
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
				description: 'Maximum number of items to return',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				placeholder: 'e.g. en',
				description: 'Language of the videos to return (ISO 639-1 two-letter code)',
			},
			{
				displayName: 'Period',
				name: 'period',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Day',
						value: 'day',
					},
					{
						name: 'Month',
						value: 'month',
					},
					{
						name: 'Week',
						value: 'week',
					},
				],
				default: 'all',
				description: 'Period during which the videos were created',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{
						name: 'Time',
						value: 'time',
						description: 'Sort by creation time (newest first)',
					},
					{
						name: 'Trending',
						value: 'trending',
						description: 'Sort by trending',
					},
					{
						name: 'Views',
						value: 'views',
						description: 'Sort by view count (highest first)',
					},
				],
				default: 'time',
				description: 'Sort order of the videos',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Archive',
						value: 'archive',
						description: 'Past broadcasts',
					},
					{
						name: 'Highlight',
						value: 'highlight',
					},
					{
						name: 'Upload',
						value: 'upload',
					},
				],
				default: 'all',
				description: 'Type of videos to return',
			},
		],
	},
];

const deleteVideosFields: INodeProperties[] = [
	{
		displayName: 'Video IDs',
		name: 'deleteVideoIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 234482848 or 234482848,234482850',
		description: 'ID(s) of the video(s) to delete. Separate multiple IDs with commas. Maximum 5 IDs.',
	},
	{
		displayName: 'Note',
		name: 'deleteNote',
		type: 'notice',
		default: '',
		description: 'Requires OAuth2 authentication with channel:manage:videos scope. You can only delete videos owned by the authenticated user.',
	},
];

export const videoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['video'],
			},
		},
		options: [
			{
				name: 'Get Videos',
				value: 'getVideos',
				action: 'Get videos',
				description: 'Get videos by user ID, game ID, or video ID',
				routing: {
					request: {
						method: 'GET',
						url: '/videos',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const queryBy = this.getNodeParameter('queryBy', 0) as string;
								const qs: IDataObject = {};

								// Add required parameter based on query type
								if (queryBy === 'userId') {
									const userIdInput = this.getNodeParameter('userId', 0) as string;
									const userId = await resolveUserIdOrUsername.call(this, userIdInput);
									qs.user_id = userId;
								} else if (queryBy === 'gameId') {
									const gameId = this.getNodeParameter('gameId', 0) as string;
									qs.game_id = gameId;
								} else if (queryBy === 'videoId') {
									const videoIds = this.getNodeParameter('videoIds', 0) as string;
									qs.id = videoIds;
								}

								// Add optional parameters
								const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

								if (additionalFields.first) {
									qs.first = additionalFields.first;
								}
								if (additionalFields.language) {
									qs.language = additionalFields.language;
								}
								if (additionalFields.period) {
									qs.period = additionalFields.period;
								}
								if (additionalFields.sort) {
									qs.sort = additionalFields.sort;
								}
								if (additionalFields.type) {
									qs.type = additionalFields.type;
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
				name: 'Delete Videos',
				value: 'deleteVideos',
				action: 'Delete videos',
				description: 'Delete one or more videos (requires OAuth2 with channel:manage:videos scope)',
				routing: {
					request: {
						method: 'DELETE',
						url: '/videos',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const videoIds = this.getNodeParameter('deleteVideoIds', 0) as string;
								requestOptions.qs = {
									id: videoIds,
								};
								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'getVideos',
	},
];

export const videoFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['video'], operation: ['getVideos'] } }, getVideosFields),
	...updateDisplayOptions({ show: { resource: ['video'], operation: ['deleteVideos'] } }, deleteVideosFields),
];
