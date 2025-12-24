import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export class TwitchChannels implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Channels',
		name: 'twitchChannels',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Channels API',
		defaults: {
			name: 'Twitch Channels',
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
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getInfo'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
		],
	};
}
