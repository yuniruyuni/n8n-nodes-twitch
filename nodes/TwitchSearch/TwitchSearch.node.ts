import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Search',
		name: 'twitchSearch',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Search Twitch channels and categories',
		defaults: {
			name: 'Twitch Search',
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
						name: 'Search Channels',
						value: 'searchChannels',
						action: 'Search for channels',
						description: 'Search for channels matching a query',
						routing: {
							request: {
								method: 'GET',
								url: '/search/channels',
								qs: {
									query: '={{$parameter.query}}',
									'={{$parameter.first ? "first" : undefined}}': '={{$parameter.first}}',
									'={{$parameter.liveOnly !== undefined ? "live_only" : undefined}}': '={{$parameter.liveOnly}}',
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
					{
						name: 'Search Categories',
						value: 'searchCategories',
						action: 'Search for categories',
						description: 'Search for categories/games matching a query',
						routing: {
							request: {
								method: 'GET',
								url: '/search/categories',
								qs: {
									query: '={{$parameter.query}}',
									'={{$parameter.first ? "first" : undefined}}': '={{$parameter.first}}',
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
				default: 'searchChannels',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. starcraft',
				description: 'The search query',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				default: 20,
				description: 'Maximum number of objects to return. Maximum: 100. Default: 20.',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
			{
				displayName: 'Live Only',
				name: 'liveOnly',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['searchChannels'],
					},
				},
				default: false,
				description: 'Whether to only return channels that are currently live',
			},
		],
	};
}
