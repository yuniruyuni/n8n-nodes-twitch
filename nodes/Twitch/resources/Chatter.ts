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
								const first = this.getNodeParameter('first', 100) as number;
								const after = this.getNodeParameter('after', '') as string;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									first: first,
								};

								// Add optional pagination cursor if provided
								if (after) {
									requestOptions.qs.after = after;
								}

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
		displayName: 'Limit',
		name: 'first',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['chatter'],
				operation: ['get'],
			},
		},
		default: 100,
		description: 'The maximum number of items to return per page. Min: 1, Max: 1000, Default: 100.',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
	},
	{
		displayName: 'Cursor',
		name: 'after',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chatter'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'The cursor used to get the next page of results',
	},
];
