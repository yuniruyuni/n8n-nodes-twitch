import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const channelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['channel'],
			},
		},
		options: [
			{
				name: 'Get Information',
				value: 'getInfo',
				action: 'Get channel information',
				description: 'Get information about a channel',
				routing: {
					request: {
						method: 'GET',
						url: '/channels',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
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
		default: 'getInfo',
	},
];

export const channelFields: INodeProperties[] = [
	// broadcasterId is now in CommonFields.ts
];
