import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
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
];

export const userFields: INodeProperties[] = [
	{
		displayName: 'User Login',
		name: 'userLogin',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. username',
		description: 'The user login name',
	},
];
