import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export class TwitchBans implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Bans',
		name: 'twitchBans',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage banned users in a Twitch channel',
		defaults: {
			name: 'Twitch Bans',
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
						name: 'Ban User',
						value: 'banUser',
						action: 'Ban a user from chat',
						description: 'Ban a user from the broadcaster\'s chat room',
						routing: {
							request: {
								method: 'POST',
								url: '/moderation/bans',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
										const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
										const userIdInput = this.getNodeParameter('userId') as string;

										// Resolve usernames to user IDs
										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
										const moderatorId = await resolveUserIdOrUsername.call(this, moderatorIdInput);
										const userId = await resolveUserIdOrUsername.call(this, userIdInput);

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
											moderator_id: moderatorId,
										};

										const data: IDataObject = {
											user_id: userId,
										};

										const duration = this.getNodeParameter('duration', 0) as number;
										if (duration > 0) {
											data.duration = duration;
										}

										const reason = this.getNodeParameter('reason', '') as string;
										if (reason) {
											data.reason = reason;
										}

										const body: IDataObject = {
											data,
										};

										requestOptions.qs = qs;
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
						name: 'Unban User',
						value: 'unbanUser',
						action: 'Unban a user',
						description: 'Remove a ban or timeout on a user',
						routing: {
							request: {
								method: 'DELETE',
								url: '/moderation/bans',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
										const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
										const userIdInput = this.getNodeParameter('userId') as string;

										// Resolve usernames to user IDs
										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
										const moderatorId = await resolveUserIdOrUsername.call(this, moderatorIdInput);
										const userId = await resolveUserIdOrUsername.call(this, userIdInput);

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
											moderator_id: moderatorId,
											user_id: userId,
										};

										requestOptions.qs = qs;
										return requestOptions;
									},
								],
							},
						},
					},
					{
						name: 'Get Banned Users',
						value: 'getBannedUsers',
						action: 'Get list of banned users',
						description: 'Get all users banned in the broadcaster\'s chat room',
						routing: {
							request: {
								method: 'GET',
								url: '/moderation/banned',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
										};

										const userIds = this.getNodeParameter('userIds', '') as string;
										if (userIds) {
											// Split comma-separated user IDs/usernames and resolve each
											const userIdInputs = userIds.split(',').map(id => id.trim()).filter(id => id);
											if (userIdInputs.length > 0) {
												const resolvedUserIds = await Promise.all(
													userIdInputs.map(input => resolveUserIdOrUsername.call(this, input))
												);
												qs.user_id = resolvedUserIds;
											}
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
				default: 'getBannedUsers',
			},
			// Ban User Parameters
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['banUser'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'Moderator ID or Username',
				name: 'moderatorId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['banUser'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321 or username',
				description: 'The moderator user ID or username (must match the user access token). If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User ID or Username',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['banUser'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 555666777 or username',
				description: 'The user ID or username to ban. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['banUser'],
					},
				},
				default: 0,
				placeholder: 'e.g. 600',
				description: 'The duration of the ban in seconds. If 0 or omitted, the ban is permanent. Max: 1,209,600 (2 weeks).',
				typeOptions: {
					minValue: 0,
					maxValue: 1209600,
				},
			},
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['banUser'],
					},
				},
				default: '',
				placeholder: 'e.g. Violation of chat rules',
				description: 'The reason for the ban (max 500 characters)',
			},
			// Unban User Parameters
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['unbanUser'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'Moderator ID or Username',
				name: 'moderatorId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['unbanUser'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321 or username',
				description: 'The moderator user ID or username (must match the user access token). If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User ID or Username',
				name: 'userId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['unbanUser'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 555666777 or username',
				description: 'The user ID or username to unban. If a username is provided, it will be automatically converted to user ID.',
			},
			// Get Banned Users Parameters
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getBannedUsers'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User IDs or Usernames',
				name: 'userIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getBannedUsers'],
					},
				},
				default: '',
				placeholder: 'e.g. 555666777,888999000 or user1,user2',
				description: 'Comma-separated list of user IDs or usernames to filter results. Usernames will be automatically converted to user IDs.',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getBannedUsers'],
					},
				},
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of objects to return (1-100)',
			},
		],
	};
}
