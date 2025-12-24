import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchChatters implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Chatters',
		name: 'twitchChatters',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Get chatters in a Twitch channel',
		defaults: {
			name: 'Twitch Chatters',
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
						name: 'Get',
						value: 'get',
						action: 'Get chatters',
						description: 'Get the list of users that are connected to the broadcaster\'s chat session',
						routing: {
							request: {
								method: 'GET',
								url: '/chat/chatters',
								qs: {
									broadcaster_id: '={{$parameter.broadcasterId}}',
									moderator_id: '={{$parameter.moderatorId}}',
									first: '={{$parameter.first}}',
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
				required: true,
				description: 'The ID of the broadcaster whose list of chatters you want to get',
			},
			{
				displayName: 'Moderator ID',
				name: 'moderatorId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the moderator requesting the list of chatters',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				displayOptions: {
					show: {
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
		],
	};
}
