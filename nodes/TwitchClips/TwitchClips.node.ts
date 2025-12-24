import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchClips implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Clips',
		name: 'twitchClips',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Clips API',
		defaults: {
			name: 'Twitch Clips',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.twitch.tv/helix',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
								qs: {
									broadcaster_id: '={{$parameter.broadcasterId}}',
									has_delay: '={{$parameter.hasDelay}}',
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
											qs.broadcaster_id = this.getNodeParameter('broadcasterId') as string;
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
			// Create Clip Parameters
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createClip'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID whose stream will be clipped',
			},
			{
				displayName: 'Has Delay',
				name: 'hasDelay',
				type: 'boolean',
				displayOptions: {
					show: {
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
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getClips'],
						filterType: ['broadcasterId'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID',
			},
			{
				displayName: 'Game ID',
				name: 'gameId',
				type: 'string',
				displayOptions: {
					show: {
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
						operation: ['getClips'],
						filterType: ['broadcasterId', 'gameId'],
					},
				},
				default: '',
				placeholder: 'e.g. 2021-12-31T23:59:59Z',
				description: 'The end date/time for clips (RFC3339 format)',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getClips'],
						filterType: ['broadcasterId', 'gameId'],
					},
				},
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of clips to return (1-100)',
			},
		],
	};
}
