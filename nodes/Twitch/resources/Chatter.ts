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
			}
];

export const chatterFields: INodeProperties[] = [
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
				resource: ['chatter'],
						operation: ['get'],
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
				resource: ['chatter'],
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321 or username',
				description: 'The moderator user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				displayOptions: {
					show: {
				resource: ['chatter'],
						operation: ['get'],
					},
				},
				default: 100,
				description: 'The maximum number of items to return (1-1000)',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
			},
];