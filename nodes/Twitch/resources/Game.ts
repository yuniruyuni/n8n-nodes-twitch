import { ApplicationError } from 'n8n-workflow';
import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getGamesFields: INodeProperties[] = [
	{
		displayName: 'Search By',
		name: 'searchBy',
		type: 'options',
		options: [
			{
				name: 'Game ID',
				value: 'id',
				description: 'Search by Twitch game ID',
			},
			{
				name: 'Game Name',
				value: 'name',
				description: 'Search by game name',
			},
			{
				name: 'IGDB ID',
				value: 'igdb_id',
				description: 'Search by IGDB (Internet Game Database) ID',
			},
		],
		default: 'name',
		description: 'The field to search games by',
	},
	{
		displayName: 'Search Value',
		name: 'searchValue',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Fortnite or 33214,493057',
		description: 'The value to search for. Supports multiple values separated by commas (max 100).',
	},
];

const getTopGamesFields: INodeProperties[] = [
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'Maximum number of items to return',
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for forward pagination. Get this from the pagination object in the previous response.',
	},
	{
		displayName: 'Before',
		name: 'before',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for backward pagination. Get this from the pagination object in the previous response.',
	},
];

export const gameOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['game'],
			},
		},
		options: [
			{
				name: 'Get Games',
				value: 'getGames',
				action: 'Get games by ID or name',
				description: 'Get games by ID, name, or IGDB ID',
				routing: {
					request: {
						method: 'GET',
						url: '/games',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const searchBy = this.getNodeParameter('searchBy', 0) as string;
								const searchValue = this.getNodeParameter('searchValue', 0) as string;

								if (!searchValue || searchValue.trim() === '') {
									throw new ApplicationError('Search value is required');
								}

								// Split by comma and trim whitespace
								const values = searchValue.split(',').map((v) => v.trim()).filter((v) => v !== '');

								if (values.length === 0) {
									throw new ApplicationError('At least one search value is required');
								}

								// Build query string parameters
								const qs: Record<string, string | string[]> = {};

								if (searchBy === 'id') {
									qs.id = values;
								} else if (searchBy === 'name') {
									qs.name = values;
								} else if (searchBy === 'igdb_id') {
									qs.igdb_id = values;
								}

								requestOptions.qs = qs;

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
						],
					},
				},
			},
			{
				name: 'Get Top Games',
				value: 'getTopGames',
				action: 'Get top games by viewer count',
				description: 'Get top games sorted by viewer count',
				routing: {
					request: {
						method: 'GET',
						url: '/games/top',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const first = this.getNodeParameter('first', 0) as number;
								const after = this.getNodeParameter('after', 0) as string;
								const before = this.getNodeParameter('before', 0) as string;

								const qs: Record<string, string | number> = {};

								if (first) {
									// Validate first parameter (max 100)
									if (first < 1 || first > 100) {
										throw new ApplicationError('First parameter must be between 1 and 100');
									}
									qs.first = first;
								}

								if (after && after.trim() !== '') {
									qs.after = after.trim();
								}

								if (before && before.trim() !== '') {
									qs.before = before.trim();
								}

								requestOptions.qs = qs;

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
						],
					},
				},
			},
		],
		default: 'getGames',
	},
];

export const gameFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['game'], operation: ['getGames'] } }, getGamesFields),
	...updateDisplayOptions({ show: { resource: ['game'], operation: ['getTopGames'] } }, getTopGamesFields),
];
