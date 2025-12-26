import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const searchCommonFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. angel of death',
		description: 'Search query string. Enter plain text - spaces and special characters will be automatically encoded.',
	},
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		description: 'Maximum number of items to return per page (1-100). Default is 20.',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		description: 'Cursor for pagination. Use the cursor from the previous response to get the next page.',
	},
];

const searchChannelsFields: INodeProperties[] = [
	{
		displayName: 'Live Only',
		name: 'live_only',
		type: 'boolean',
		default: false,
		description: 'Whether to return only channels that are currently streaming live. Default is false (both live and offline channels).',
	},
];

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
				description: 'Search for channels that have streamed content within the past 6 months',
				routing: {
					request: {
						method: 'GET',
						url: '/search/channels',
						qs: {
							query: '={{$parameter.query}}',
							'={{$parameter.first ? "first" : undefined}}': '={{$parameter.first}}',
							'={{$parameter.after ? "after" : undefined}}': '={{$parameter.after}}',
							'={{$parameter.live_only !== undefined ? "live_only" : undefined}}': '={{$parameter.live_only}}',
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
				description: 'Search for games or categories matching a query',
				routing: {
					request: {
						method: 'GET',
						url: '/search/categories',
						qs: {
							query: '={{$parameter.query}}',
							'={{$parameter.first ? "first" : undefined}}': '={{$parameter.first}}',
							'={{$parameter.after ? "after" : undefined}}': '={{$parameter.after}}',
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
];

export const searchFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['search'] } }, searchCommonFields),
	...updateDisplayOptions({ show: { resource: ['search'], operation: ['searchChannels'] } }, searchChannelsFields),
];
