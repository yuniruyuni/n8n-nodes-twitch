import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

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
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
										const userIdInput = this.getNodeParameter('userId', 0) as string;
										const first = this.getNodeParameter('first', 0) as number;
										const after = this.getNodeParameter('after', 0) as string;

										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
										};

										if (userIdInput) {
											const userIds = userIdInput.split(',').map((id) => id.trim()).filter((id) => id);
											if (userIds.length > 0) {
												// Resolve each user ID or username
												const resolvedUserIds = await Promise.all(
													userIds.map((id) => resolveUserIdOrUsername.call(this, id))
												);
												qs.user_id = resolvedUserIds;
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
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
										const userIdInput = this.getNodeParameter('checkUserId', 0) as string;

										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
										const userId = await resolveUserIdOrUsername.call(this, userIdInput);

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
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'User IDs or Usernames',
				name: 'userId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123456789,987654321 or username1,username2',
				description: 'Filter by user IDs or usernames (comma-separated)',
				displayOptions: {
					show: {
						operation: ['getBroadcasterSubscriptions'],
					},
				},
			},
			{
				displayName: 'User ID or Username',
				name: 'checkUserId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789 or username',
				description: 'The user ID or username to check. If a username is provided, it will be automatically converted to user ID.',
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
