import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const emoteOperations: INodeProperties[] = [
	{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['emote'],
			},
		},
				options: [
					{
						name: 'Get Channel Emotes',
						value: 'getChannelEmotes',
						action: 'Get channel emotes',
						description: 'Get emotes for a specific Twitch channel',
						routing: {
							request: {
								method: 'GET',
								url: '/chat/emotes',
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
				],
				default: 'getChannelEmotes',
			}
];

export const emoteFields: INodeProperties[] = [
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
				resource: ['emote'],
						operation: ['getChannelEmotes'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username whose emotes you want to get. If a username is provided, it will be automatically converted to user ID.',
			},
];