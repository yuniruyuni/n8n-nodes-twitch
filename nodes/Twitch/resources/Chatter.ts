import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

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
								const first = this.getNodeParameter('first') as number;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrUsername.call(this, moderatorIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									first: first,
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
		default: 'get',
	},
];

export const chatterFields: INodeProperties[] = [];
