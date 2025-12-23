import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchSubscriptions implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Subscriptions',
		name: 'twitchSubscriptions',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Subscriptions API',
		defaults: {
			name: 'Twitch Subscriptions',
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
						name: 'Get Broadcaster Subscriptions',
						value: 'getBroadcasterSubscriptions',
						action: 'Get broadcaster subscriptions',
						description: 'Get a list of broadcaster subscriptions',
						routing: {
							request: {
								method: 'GET',
								url: '/subscriptions',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const userId = this.getNodeParameter('userId', 0) as string;
										const first = this.getNodeParameter('first', 0) as number;
										const after = this.getNodeParameter('after', 0) as string;

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
										};

										if (userId) {
											const userIds = userId.split(',').map((id) => id.trim()).filter((id) => id);
											if (userIds.length > 0) {
												qs.user_id = userIds;
											}
										}

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
						name: 'Check User Subscription',
						value: 'checkUserSubscription',
						action: 'Check user subscription',
						description: 'Check if a user is subscribed to a broadcaster',
						routing: {
							request: {
								method: 'GET',
								url: '/subscriptions/user',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const userId = this.getNodeParameter('checkUserId', 0) as string;

										requestOptions.qs = {
											broadcaster_id: broadcasterId,
											user_id: userId,
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
				],
				default: 'getBroadcasterSubscriptions',
			},
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789',
			},
			{
				displayName: 'User IDs',
				name: 'userId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123456789,987654321',
				description: 'Filter by user IDs (comma-separated)',
				displayOptions: {
					show: {
						operation: ['getBroadcasterSubscriptions'],
					},
				},
			},
			{
				displayName: 'User ID',
				name: 'checkUserId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789',
				description: 'The user ID to check',
				displayOptions: {
					show: {
						operation: ['checkUserSubscription'],
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
					maxValue: 100,
				},
				placeholder: 'e.g. 20',
				description: 'Number of results (1-100)',
				displayOptions: {
					show: {
						operation: ['getBroadcasterSubscriptions'],
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
						operation: ['getBroadcasterSubscriptions'],
					},
				},
			},
		],
	};
}
