/**
 * Subscription Resource
 *
 * Operations for Twitch Subscription API endpoints:
 * - Get Broadcaster Subscriptions
 * - Check User Subscription
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-broadcaster-subscriptions
 */

import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { createLimitBasedPagination } from '../shared/pagination';

// Field definitions for each operation
const getBroadcasterSubscriptionsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456789,987654321 or username1,username2',
		description: 'Filter by user IDs or usernames (comma-separated)',
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
];

const checkUserSubscriptionFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'User',
		name: 'checkUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The user ID or login name to check. If a login name is provided, it will be automatically converted to user ID.',
	},
];

export const subscriptionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['subscription'],
			},
		},
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
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 100 : (this.getNodeParameter('limit', 100) as number);

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
								};

								if (userIdInput) {
									const userIds = userIdInput.split(',').map((id) => id.trim()).filter((id) => id);
									if (userIds.length > 0) {
										// Resolve each user ID or login name
										const resolvedUserIds = await Promise.all(
											userIds.map((id) => resolveUserIdOrLogin.call(this, id))
										);
										qs.user_id = resolvedUserIds;
									}
								}

								// Optimal page size: API max when returnAll, otherwise min(limit, API max)
								qs.first = returnAll ? 100 : Math.min(limit, 100);

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

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);

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
						],
					},
				},
			},
		],
		default: 'getBroadcasterSubscriptions',
	},
];

export const subscriptionFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['subscription'], operation: ['getBroadcasterSubscriptions'] } }, getBroadcasterSubscriptionsFields),
	...updateDisplayOptions({ show: { resource: ['subscription'], operation: ['checkUserSubscription'] } }, checkUserSubscriptionFields),
];
