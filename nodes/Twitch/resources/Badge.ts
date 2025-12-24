import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const badgeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['badge'],
			},
		},
		options: [
			{
				name: 'Get Channel Chat Badges',
				value: 'getChannelChatBadges',
				action: 'Get channel chat badges',
				description: 'Get the broadcaster\'s list of custom chat badges',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/badges',
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
						],
					},
				},
			},
			{
				name: 'Get Global Chat Badges',
				value: 'getGlobalChatBadges',
				action: 'Get global chat badges',
				description: 'Get Twitch\'s list of chat badges available in any channel',
				routing: {
					request: {
						method: 'GET',
						url: '/chat/badges/global',
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
		default: 'getChannelChatBadges',
	},
];

export const badgeFields: INodeProperties[] = [
	// Get Channel Chat Badges fields
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['badge'],
				operation: ['getChannelChatBadges'],
			},
		},
		default: '',
		description: 'The ID or username of the broadcaster whose chat badges you want to get',
	},
];
