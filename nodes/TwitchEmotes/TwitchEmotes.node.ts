import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export class TwitchEmotes implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Emotes',
		name: 'twitchEmotes',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		description: 'Get emotes for a Twitch channel',
		defaults: {
			name: 'Twitch Emotes',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.twitch.tv/helix',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
			},
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getChannelEmotes'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username whose emotes you want to get. If a username is provided, it will be automatically converted to user ID.',
			},
		],
	};
}
