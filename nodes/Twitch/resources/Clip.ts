import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const createClipFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The ID or username of the broadcaster whose stream you want to create a clip from. If a username is provided, it will be automatically converted to user ID. This ID must match the user ID in the access token or the user must be an editor for the channel.',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		placeholder: 'e.g. Epic Moment',
		description: 'The title of the clip',
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: 30,
		typeOptions: {
			minValue: 5,
			maxValue: 60,
			numberPrecision: 1,
		},
		description: 'The length of the clip in seconds (5-60). Default is 30.',
	},
];

const getClipsFields: INodeProperties[] = [
	{
		displayName: 'Filter Type',
		name: 'filterType',
		type: 'options',
		options: [
			{
				name: 'Broadcaster ID',
				value: 'broadcasterId',
				description: 'Get clips for a specific broadcaster',
			},
			{
				name: 'Game ID',
				value: 'gameId',
				description: 'Get clips for a specific game',
			},
			{
				name: 'Clip ID',
				value: 'clipId',
				description: 'Get a specific clip by ID',
			},
		],
		default: 'broadcasterId',
		required: true,
		description: 'The type of filter to use when retrieving clips. These filters are mutually exclusive - you can only use one at a time.',
	},
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				filterType: ['broadcasterId'],
			},
		},
		default: '',
		placeholder: 'e.g. 123456789 or username',
		description: 'The ID or username of the broadcaster whose clips you want to get. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		displayOptions: {
			show: {
				filterType: ['gameId'],
			},
		},
		default: '',
		placeholder: 'e.g. 987654321',
		description: 'The ID of the game whose clips you want to get',
	},
	{
		displayName: 'Clip ID',
		name: 'clipId',
		type: 'string',
		displayOptions: {
			show: {
				filterType: ['clipId'],
			},
		},
		default: '',
		placeholder: 'e.g. AwkwardHelplessSalamanderSwiftRage or clip1,clip2,clip3',
		description: 'One or more clip IDs separated by commas (max 100)',
	},
	{
		displayName: 'Started At',
		name: 'startedAt',
		type: 'string',
		displayOptions: {
			show: {
				filterType: ['broadcasterId', 'gameId'],
			},
		},
		default: '',
		placeholder: 'e.g. 2021-01-01T00:00:00Z',
		description: 'The start date/time for clips (RFC3339 format)',
	},
	{
		displayName: 'Ended At',
		name: 'endedAt',
		type: 'string',
		displayOptions: {
			show: {
				filterType: ['broadcasterId', 'gameId'],
			},
		},
		default: '',
		placeholder: 'e.g. 2021-12-31T23:59:59Z',
		description: 'The end date/time for clips (RFC3339 format)',
	},
	{
		displayName: 'Is Featured',
		name: 'isFeatured',
		type: 'boolean',
		displayOptions: {
			show: {
				filterType: ['broadcasterId', 'gameId'],
			},
		},
		default: false,
		description: 'Whether to filter by featured clips only',
	},
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'Maximum number of clips to return (1-100). Default is 20.',
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for forward pagination. Get this from the pagination object in the previous response.',
	},
	{
		displayName: 'Before',
		name: 'before',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for backward pagination. Get this from the pagination object in the previous response.',
	},
];

export const clipOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['clip'],
			},
		},
		options: [
			{
				name: 'Create Clip',
				value: 'createClip',
				action: 'Create a clip',
				description: 'Create a clip from a broadcaster\'s stream',
				routing: {
					request: {
						method: 'POST',
						url: '/clips',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const title = this.getNodeParameter('title', '') as string;
								const duration = this.getNodeParameter('duration', 30) as number;

								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
								};

								if (title) {
									qs.title = title;
								}

								if (duration !== 30) {
									qs.duration = duration;
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
				name: 'Get Clips',
				value: 'getClips',
				action: 'Get clips',
				description: 'Get one or more clips',
				routing: {
					request: {
						method: 'GET',
						url: '/clips',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								// Build query parameters based on filter type
								const filterType = this.getNodeParameter('filterType') as string;
								const qs: IDataObject = {};

								if (filterType === 'broadcasterId') {
									const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
									const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
									qs.broadcaster_id = broadcasterId;
								} else if (filterType === 'gameId') {
									qs.game_id = this.getNodeParameter('gameId') as string;
								} else if (filterType === 'clipId') {
									const clipIdInput = this.getNodeParameter('clipId') as string;
									// Split by comma and trim whitespace, support multiple clip IDs
									const clipIds = clipIdInput.split(',').map((id) => id.trim()).filter((id) => id !== '');
									qs.id = clipIds;
								}

								// Add optional parameters
								const startedAt = this.getNodeParameter('startedAt', '') as string;
								if (startedAt) {
									qs.started_at = startedAt;
								}

								const endedAt = this.getNodeParameter('endedAt', '') as string;
								if (endedAt) {
									qs.ended_at = endedAt;
								}

								const isFeatured = this.getNodeParameter('isFeatured', false) as boolean;
								if (isFeatured) {
									qs.is_featured = isFeatured;
								}

								const first = this.getNodeParameter('first', 20) as number;
								if (first) {
									qs.first = first;
								}

								const after = this.getNodeParameter('after', '') as string;
								if (after && after.trim() !== '') {
									qs.after = after.trim();
								}

								const before = this.getNodeParameter('before', '') as string;
								if (before && before.trim() !== '') {
									qs.before = before.trim();
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
		],
		default: 'getClips',
	},
];

export const clipFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['clip'], operation: ['createClip'] } }, createClipFields),
	...updateDisplayOptions({ show: { resource: ['clip'], operation: ['getClips'] } }, getClipsFields),
];
