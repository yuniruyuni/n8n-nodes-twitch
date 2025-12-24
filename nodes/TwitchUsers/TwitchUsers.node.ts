import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchUsers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Users',
		name: 'twitchUsers',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Users API',
		defaults: {
			name: 'Twitch Users',
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
						action: 'Get a user',
						description: 'Get information about a user',
						routing: {
							request: {
								method: 'GET',
								url: '/users',
								qs: {
									login: '={{$parameter.userLogin}}',
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
				default: 'get',
			},
			{
				displayName: 'User Login',
				name: 'userLogin',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. username',
				description: 'The user login name',
			},
		],
	};
}
