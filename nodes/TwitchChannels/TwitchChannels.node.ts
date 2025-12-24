import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

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
								qs: {
									broadcaster_id: '={{$parameter.broadcasterId}}',
								},
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
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getInfo'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID',
			},
		],
	};
}
