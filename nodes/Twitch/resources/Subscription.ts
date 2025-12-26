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
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'Maximum number of items to return',
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for forward pagination. Do not specify if you set the User ID parameter.',
	},
	{
		displayName: 'Before',
		name: 'before',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for backward pagination. Do not specify if you set the User ID parameter.',
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
								const first = this.getNodeParameter('first', 0) as number;
								const after = this.getNodeParameter('after', 0) as string;
								const before = this.getNodeParameter('before', 0) as string;

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

								if (first) qs.first = first;
								if (after) qs.after = after;
								if (before) qs.before = before;

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
