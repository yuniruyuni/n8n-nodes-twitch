/**
 * Video Resource
 *
 * Operations for Twitch Video API endpoints:
 * - Get Videos
 * - Delete Videos
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-videos
 */

import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { createLimitBasedPagination } from '../shared/pagination';

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
		displayName: 'User',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				queryBy: ['userId'],
			},
		},
		default: '',
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'User ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Game',
		name: 'gameId',
		type: 'string',
		displayOptions: {
			show: {
				queryBy: ['gameId'],
			},
		},
		default: '',
		placeholder: 'e.g. 493057',
		description: 'Game ID. ID of the game the videos are of.',
	},
	{
		displayName: 'Videos',
		name: 'videoIds',
		type: 'string',
		displayOptions: {
			show: {
				queryBy: ['videoId'],
			},
		},
		default: '',
		placeholder: 'e.g. 234482848 or 234482848,234482850',
		description: 'Video ID(s). Separate multiple IDs with commas. Maximum 100 IDs.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
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
		displayName: 'Videos',
		name: 'deleteVideoIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 234482848 or 234482848,234482850',
		description: 'Video ID(s) to delete. Separate multiple IDs with commas. Maximum 5 IDs.',
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
								const queryBy = this.getNodeParameter('queryBy') as string;
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 100 : (this.getNodeParameter('limit', 50) as number);
								const qs: IDataObject = {};

								// Add required parameter based on query type
								if (queryBy === 'userId') {
									const userIdInput = this.getNodeParameter('userId', '') as string;
									const userId = await resolveUserIdOrLogin.call(this, userIdInput);
									qs.user_id = userId;
								} else if (queryBy === 'gameId') {
									const gameId = this.getNodeParameter('gameId', '') as string;
									qs.game_id = gameId;
								} else if (queryBy === 'videoId') {
									const videoIds = this.getNodeParameter('videoIds', '') as string;
									qs.id = videoIds;
								}

								// Add optional parameters
								const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;

								// Optimal page size: API max when returnAll, otherwise min(limit, API max)
								qs.first = returnAll ? 100 : Math.min(limit, 100);

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
					operations: {
						pagination: createLimitBasedPagination(100),
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
							{
								type: 'limit',
								properties: {
									maxResults: '={{$parameter.returnAll ? undefined : $parameter.limit}}',
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
								const videoIds = this.getNodeParameter('deleteVideoIds', '') as string;
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
