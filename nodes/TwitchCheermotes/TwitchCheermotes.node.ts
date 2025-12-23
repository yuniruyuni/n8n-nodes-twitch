import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchCheermotes implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Cheermotes',
		name: 'twitchCheermotes',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Get Cheermotes for a Twitch channel',
		defaults: {
			name: 'Twitch Cheermotes',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['clientCredentials'],
					},
				},
			},
			{
				name: 'twitchOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
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
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Client Credentials',
						value: 'clientCredentials',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get cheermotes',
						description: 'Get the list of Cheermotes (animated emotes used with Bits)',
						routing: {
							request: {
								method: 'GET',
								url: '=/bits/cheermotes{{$parameter.broadcasterId ? "?broadcaster_id=" + $parameter.broadcasterId : ""}}',
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
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the broadcaster whose cheermotes you want to get. If omitted, returns global cheermotes.',
			},
		],
	};
}
