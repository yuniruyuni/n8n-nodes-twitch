import { ApplicationError, NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

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
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
										const userIdsInput = this.getNodeParameter('userIds', 0) as string;
										const first = this.getNodeParameter('first', 0) as number;

										if (!broadcasterIdInput || broadcasterIdInput.trim() === '') {
											throw new ApplicationError('Broadcaster ID is required');
										}

										// Validate first parameter (1-100)
										if (first < 1 || first > 100) {
											throw new ApplicationError('First parameter must be between 1 and 100');
										}

										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput.trim());

										const qs: Record<string, string | string[] | number> = {
											broadcaster_id: broadcasterId,
											first,
										};

										// Handle comma-separated user IDs
										if (userIdsInput && userIdsInput.trim() !== '') {
											const userIdList = userIdsInput.split(',').map((v) => v.trim()).filter((v) => v !== '');
											if (userIdList.length > 0) {
												// Resolve each user ID or username
												const resolvedUserIds = await Promise.all(
													userIdList.map((id) => resolveUserIdOrUsername.call(this, id))
												);
												qs.user_id = resolvedUserIds;
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
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
										const userIdInput = this.getNodeParameter('userId', 0) as string;

										if (!broadcasterIdInput || broadcasterIdInput.trim() === '') {
											throw new ApplicationError('Broadcaster ID is required');
										}

										if (!userIdInput || userIdInput.trim() === '') {
											throw new ApplicationError('User ID is required');
										}

										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput.trim());
										const userId = await resolveUserIdOrUsername.call(this, userIdInput.trim());

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
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
										const userIdInput = this.getNodeParameter('userId', 0) as string;

										if (!broadcasterIdInput || broadcasterIdInput.trim() === '') {
											throw new ApplicationError('Broadcaster ID is required');
										}

										if (!userIdInput || userIdInput.trim() === '') {
											throw new ApplicationError('User ID is required');
										}

										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput.trim());
										const userId = await resolveUserIdOrUsername.call(this, userIdInput.trim());

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
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 141981764 or username',
				description: 'The broadcaster user ID or username whose list of moderators you want to get. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User IDs or Usernames',
				name: 'userIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				placeholder: 'e.g. 123456,789012 or username1,username2',
				description: 'Filters the list for specific moderators. Comma-separated list of user IDs or usernames. Maximum 100.',
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
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['add'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 141981764 or username',
				description: 'The broadcaster user ID or username that owns the chat room. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User ID or Username',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['add'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456 or username',
				description: 'The user ID or username to add as a moderator. If a username is provided, it will be automatically converted to user ID.',
			},
			// Remove operation parameters
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['remove'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 141981764 or username',
				description: 'The broadcaster user ID or username that owns the chat room. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User ID or Username',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['remove'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456 or username',
				description: 'The user ID or username to remove as a moderator. If a username is provided, it will be automatically converted to user ID.',
			},
		],
	};
}
