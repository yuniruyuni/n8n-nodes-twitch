/**
 * Chatter Resource
 *
 * Operations for Twitch Chatter API endpoints:
 * - Get Chatters
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-chatters
 */

import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { createLimitBasedPagination } from '../shared/pagination';

export const chatterOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chatter'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get chatters',
				description: 'Get the list of users that are connected to the broadcaster\'s chat session',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/chatters',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 1000 : (this.getNodeParameter('limit', 100) as number);

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									// Optimal page size: API max when returnAll, otherwise min(limit, API max)
									first: returnAll ? 1000 : Math.min(limit, 1000),
								};

								return requestOptions;
							},
						],
					},
					operations: {
						pagination: createLimitBasedPagination(1000),
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
		],
		default: 'get',
	},
];

export const chatterFields: INodeProperties[] = [
	// Fields for 'get' operation
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chatter'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'Broadcaster user ID or login name whose list of chatters you want to get',
	},
	{
		displayName: 'Moderator',
		name: 'moderatorId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chatter'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'Broadcaster user ID or login name or one of the broadcaster\'s moderators. This ID must match the user ID in the user access token.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['chatter'],
				operation: ['get'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['chatter'],
				operation: ['get'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},
];
