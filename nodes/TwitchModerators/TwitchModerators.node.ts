import { ApplicationError, NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchModerators implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Moderators',
		name: 'twitchModerators',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage moderators in a Twitch channel',
		defaults: {
			name: 'Twitch Moderators',
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
						name: 'Get',
						value: 'get',
						action: 'Get moderators in a channel',
						description: 'Get all moderators in a broadcaster\'s channel',
						routing: {
							request: {
								method: 'GET',
								url: '/moderation/moderators',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const userIds = this.getNodeParameter('userIds', 0) as string;
										const first = this.getNodeParameter('first', 0) as number;

										if (!broadcasterId || broadcasterId.trim() === '') {
											throw new ApplicationError('Broadcaster ID is required');
										}

										// Validate first parameter (1-100)
										if (first < 1 || first > 100) {
											throw new ApplicationError('First parameter must be between 1 and 100');
										}

										const qs: Record<string, string | string[] | number> = {
											broadcaster_id: broadcasterId.trim(),
											first,
										};

										// Handle comma-separated user IDs
										if (userIds && userIds.trim() !== '') {
											const userIdList = userIds.split(',').map((v) => v.trim()).filter((v) => v !== '');
											if (userIdList.length > 0) {
												qs.user_id = userIdList;
											}
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
						name: 'Add',
						value: 'add',
						action: 'Add a moderator to a channel',
						description: 'Add a moderator to the broadcaster\'s chat room',
						routing: {
							request: {
								method: 'POST',
								url: '/moderation/moderators',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const userId = this.getNodeParameter('userId', 0) as string;

										if (!broadcasterId || broadcasterId.trim() === '') {
											throw new ApplicationError('Broadcaster ID is required');
										}

										if (!userId || userId.trim() === '') {
											throw new ApplicationError('User ID is required');
										}

										requestOptions.qs = {
											broadcaster_id: broadcasterId.trim(),
											user_id: userId.trim(),
										};

										return requestOptions;
									},
								],
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { "success": true } }}',
										},
									},
								],
							},
						},
					},
					{
						name: 'Remove',
						value: 'remove',
						action: 'Remove a moderator from a channel',
						description: 'Remove a moderator from the broadcaster\'s chat room',
						routing: {
							request: {
								method: 'DELETE',
								url: '/moderation/moderators',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const userId = this.getNodeParameter('userId', 0) as string;

										if (!broadcasterId || broadcasterId.trim() === '') {
											throw new ApplicationError('Broadcaster ID is required');
										}

										if (!userId || userId.trim() === '') {
											throw new ApplicationError('User ID is required');
										}

										requestOptions.qs = {
											broadcaster_id: broadcasterId.trim(),
											user_id: userId.trim(),
										};

										return requestOptions;
									},
								],
							},
							output: {
								postReceive: [
									{
										type: 'set',
										properties: {
											value: '={{ { "success": true } }}',
										},
									},
								],
							},
						},
					},
				],
				default: 'get',
			},
			// Get operation parameters
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 141981764',
				description: 'The ID of the broadcaster whose list of moderators you want to get',
			},
			{
				displayName: 'User IDs',
				name: 'userIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				placeholder: 'e.g. 123456,789012',
				description: 'Filters the list for specific moderators. Comma-separated list of user IDs. Maximum 100.',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				placeholder: 'e.g. 20',
				description: 'Maximum number of moderators to return (1-100). Default is 20.',
			},
			// Add operation parameters
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['add'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 141981764',
				description: 'The ID of the broadcaster that owns the chat room',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['add'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456',
				description: 'The ID of the user to add as a moderator',
			},
			// Remove operation parameters
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['remove'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 141981764',
				description: 'The ID of the broadcaster that owns the chat room',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['remove'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456',
				description: 'The ID of the user to remove as a moderator',
			},
		],
	};
}
