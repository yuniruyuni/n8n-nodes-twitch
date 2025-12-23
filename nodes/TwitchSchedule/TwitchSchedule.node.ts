import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchSchedule implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Schedule',
		name: 'twitchSchedule',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Schedule API',
		defaults: {
			name: 'Twitch Schedule',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['clientCredentials'],
					},
				},
			},
			{
				name: 'twitchOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
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
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Client Credentials',
						value: 'clientCredentials',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Stream Schedule',
						value: 'getSchedule',
						action: 'Get stream schedule',
						description: 'Get channel stream schedule',
						routing: {
							request: {
								method: 'GET',
								url: '/schedule',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const id = this.getNodeParameter('id', 0) as string;
										const startTime = this.getNodeParameter('startTime', 0) as string;
										const utcOffset = this.getNodeParameter('utcOffset', 0) as string;
										const first = this.getNodeParameter('first', 0) as number;
										const after = this.getNodeParameter('after', 0) as string;

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
										};

										if (id) qs.id = id;
										if (startTime) qs.start_time = startTime;
										if (utcOffset) qs.utc_offset = utcOffset;
										if (first) qs.first = first;
										if (after) qs.after = after;

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
						name: 'Create Schedule Segment',
						value: 'createSegment',
						action: 'Create schedule segment',
						description: 'Create a stream schedule segment',
						routing: {
							request: {
								method: 'POST',
								url: '/schedule/segment',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const segmentStartTime = this.getNodeParameter('segmentStartTime', 0) as string;
										const timezone = this.getNodeParameter('timezone', 0) as string;
										const duration = this.getNodeParameter('duration', 0) as string;
										const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

										requestOptions.qs = {
											broadcaster_id: broadcasterId,
										};

										const body: IDataObject = {
											start_time: segmentStartTime,
											timezone,
											duration,
										};

										if (additionalFields.isRecurring !== undefined) {
											body.is_recurring = additionalFields.isRecurring;
										}
										if (additionalFields.categoryId) {
											body.category_id = additionalFields.categoryId;
										}
										if (additionalFields.title) {
											body.title = additionalFields.title;
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
						name: 'Update Schedule Segment',
						value: 'updateSegment',
						action: 'Update schedule segment',
						description: 'Update a stream schedule segment',
						routing: {
							request: {
								method: 'PATCH',
								url: '/schedule/segment',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const segmentId = this.getNodeParameter('segmentId', 0) as string;
										const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

										requestOptions.qs = {
											broadcaster_id: broadcasterId,
											id: segmentId,
										};

										const body: IDataObject = {};

										if (additionalFields.startTime) body.start_time = additionalFields.startTime;
										if (additionalFields.duration) body.duration = additionalFields.duration;
										if (additionalFields.categoryId) body.category_id = additionalFields.categoryId;
										if (additionalFields.title) body.title = additionalFields.title;
										if (additionalFields.isCanceled !== undefined) body.is_canceled = additionalFields.isCanceled;
										if (additionalFields.timezone) body.timezone = additionalFields.timezone;

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
						name: 'Delete Schedule Segment',
						value: 'deleteSegment',
						action: 'Delete schedule segment',
						description: 'Delete a stream schedule segment',
						routing: {
							request: {
								method: 'DELETE',
								url: '/schedule/segment',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const segmentId = this.getNodeParameter('segmentId', 0) as string;

										requestOptions.qs = {
											broadcaster_id: broadcasterId,
											id: segmentId,
										};

										return requestOptions;
									},
								],
							},
						},
					},
				],
				default: 'getSchedule',
			},
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789',
				description: 'The ID of the broadcaster',
			},
			// Get Schedule parameters
			{
				displayName: 'Segment IDs',
				name: 'id',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123,456,789',
				description: 'Segment IDs (comma-separated)',
				displayOptions: {
					show: {
						operation: ['getSchedule'],
					},
				},
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2024-01-01T00:00:00Z',
				description: 'Start time (RFC3339 format)',
				displayOptions: {
					show: {
						operation: ['getSchedule'],
					},
				},
			},
			{
				displayName: 'UTC Offset',
				name: 'utcOffset',
				type: 'string',
				default: '',
				placeholder: 'e.g. -480',
				description: 'UTC offset in minutes',
				displayOptions: {
					show: {
						operation: ['getSchedule'],
					},
				},
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 25,
				},
				placeholder: 'e.g. 20',
				description: 'Number of segments (1-25)',
				displayOptions: {
					show: {
						operation: ['getSchedule'],
					},
				},
			},
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
				description: 'Pagination cursor',
				displayOptions: {
					show: {
						operation: ['getSchedule'],
					},
				},
			},
			// Create Segment parameters
			{
				displayName: 'Start Time',
				name: 'segmentStartTime',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 2024-01-01T00:00:00Z',
				description: 'Start time (RFC3339 format)',
				displayOptions: {
					show: {
						operation: ['createSegment'],
					},
				},
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. America/New_York',
				description: 'Timezone (e.g. "America/New_York")',
				displayOptions: {
					show: {
						operation: ['createSegment'],
					},
				},
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 240',
				description: 'Duration in minutes',
				displayOptions: {
					show: {
						operation: ['createSegment'],
					},
				},
			},
			// Update/Delete Segment parameters
			{
				displayName: 'Segment ID',
				name: 'segmentId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. eyJzZWdtZW50SUQiOiI...',
				description: 'The ID of the segment',
				displayOptions: {
					show: {
						operation: ['updateSegment', 'deleteSegment'],
					},
				},
			},
			// Additional Fields
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['createSegment', 'updateSegment'],
					},
				},
				options: [
					{
						displayName: 'Category ID',
						name: 'categoryId',
						type: 'string',
						default: '',
						placeholder: 'e.g. 509658',
						description: 'Game/category ID',
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'string',
						default: '',
						placeholder: 'e.g. 240',
						description: 'Duration in minutes',
					},
					{
						displayName: 'Is Canceled',
						name: 'isCanceled',
						type: 'boolean',
						default: false,
						description: 'Whether the segment is canceled',
					},
					{
						displayName: 'Is Recurring',
						name: 'isRecurring',
						type: 'boolean',
						default: false,
						description: 'Whether the segment is recurring',
					},
					{
						displayName: 'Start Time',
						name: 'startTime',
						type: 'string',
						default: '',
						placeholder: 'e.g. 2024-01-01T00:00:00Z',
						description: 'Start time (RFC3339 format)',
					},
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						placeholder: 'e.g. America/New_York',
						description: 'Timezone (e.g. "America/New_York")',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						placeholder: 'e.g. My Stream Title',
						description: 'Title of the segment',
					},
				],
			},
		],
	};
}
