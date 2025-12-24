import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const cheermoteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['cheermote'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get cheermotes',
				description: 'Get the list of Cheermotes (animated emotes used with Bits)',
				routing: {
					request: {
						method: 'GET',
						url: '/bits/cheermotes',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', '') as string;

								if (broadcasterIdInput) {
									const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
									requestOptions.qs = {
										broadcaster_id: broadcasterId,
									};
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

export const cheermoteFields: INodeProperties[] = [];
