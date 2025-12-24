import type { INodeProperties } from 'n8n-workflow';

export const streamOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['stream'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get stream information',
				description: 'Get information about a live stream',
				routing: {
					request: {
						method: 'GET',
						url: '/streams',
						qs: {
							user_login: '={{$parameter.streamUserLogin}}',
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
];

export const streamFields: INodeProperties[] = [
	{
		displayName: 'User Login',
		name: 'streamUserLogin',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['stream'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. username',
		description: 'The user login name',
	},
];
