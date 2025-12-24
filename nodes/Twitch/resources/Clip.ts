import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

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
								const hasDelay = this.getNodeParameter('hasDelay') as boolean;

								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									has_delay: hasDelay,
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
							{
								type: 'setKeyValue',
								properties: {
									index: 0,
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
									qs.id = this.getNodeParameter('clipId') as string;
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

								const first = this.getNodeParameter('first', 20) as number;
								if (first) {
									qs.first = first;
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
	// Create Clip Parameters
	// broadcasterId is now in CommonFields.ts

	{
		displayName: 'Has Delay',
		name: 'hasDelay',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['clip'],
				operation: ['createClip'],
			},
		},
		default: false,
		description: 'Whether to add a delay before capturing the clip. If true, a delay is added before the clip is captured.',
	},
	// Get Clips Parameters
	{
		displayName: 'Filter Type',
		name: 'filterType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['clip'],
				operation: ['getClips'],
			},
		},
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
		description: 'The type of filter to use when retrieving clips',
	},
	// broadcasterId is now in CommonFields.ts

	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['clip'],
				operation: ['getClips'],
				filterType: ['gameId'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 987654321',
	},
	{
		displayName: 'Clip ID',
		name: 'clipId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['clip'],
				operation: ['getClips'],
				filterType: ['clipId'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. AwkwardHelplessSalamanderSwiftRage',
	},
	{
		displayName: 'Started At',
		name: 'startedAt',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['clip'],
				operation: ['getClips'],
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
				resource: ['clip'],
				operation: ['getClips'],
				filterType: ['broadcasterId', 'gameId'],
			},
		},
		default: '',
		placeholder: 'e.g. 2021-12-31T23:59:59Z',
		description: 'The end date/time for clips (RFC3339 format)',
	},
	// first is now in CommonFields.ts
];
