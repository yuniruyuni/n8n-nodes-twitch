import type { INodeProperties } from 'n8n-workflow';

export const searchOperations: INodeProperties[] = [
	{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
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
			}
];

export const searchFields: INodeProperties[] = [
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
				resource: ['search'],
						operation: ['searchChannels'],
					},
				},
				default: false,
				description: 'Whether to only return channels that are currently live',
			},
];