import { ApplicationError } from 'n8n-workflow';
import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const getGamesFields: INodeProperties[] = [
	{
		displayName: 'Games',
		name: 'gameIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 33214,493057',
		description: 'Game IDs to get. Supports multiple values separated by commas. Combined total with other parameters must not exceed 100.',
	},
	{
		displayName: 'Game Names',
		name: 'gameNames',
		type: 'string',
		default: '',
		placeholder: 'e.g. Fortnite,League of Legends',
		description: 'Game names to get. Must exactly match game titles. Supports multiple values separated by commas. Combined total with other parameters must not exceed 100.',
	},
	{
		displayName: 'IGDB IDs',
		name: 'igdbIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 1905,5678',
		description: 'IGDB (Internet Game Database) IDs to get. Supports multiple values separated by commas. Combined total with other parameters must not exceed 100.',
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
								const gameIds = this.getNodeParameter('gameIds', 0) as string;
								const gameNames = this.getNodeParameter('gameNames', 0) as string;
								const igdbIds = this.getNodeParameter('igdbIds', 0) as string;

								// Parse and collect all values
								const ids = gameIds ? gameIds.split(',').map((v) => v.trim()).filter((v) => v !== '') : [];
								const names = gameNames ? gameNames.split(',').map((v) => v.trim()).filter((v) => v !== '') : [];
								const igdb = igdbIds ? igdbIds.split(',').map((v) => v.trim()).filter((v) => v !== '') : [];

								// Validate that at least one parameter is provided
								if (ids.length === 0 && names.length === 0 && igdb.length === 0) {
									throw new ApplicationError('At least one of Game IDs, Game Names, or IGDB IDs is required');
								}

								// Validate total count doesn't exceed 100
								const totalCount = ids.length + names.length + igdb.length;
								if (totalCount > 100) {
									throw new ApplicationError(`Total number of IDs and names must not exceed 100 (got ${totalCount})`);
								}

								// Build query string parameters
								const qs: Record<string, string | string[]> = {};

								if (ids.length > 0) {
									qs.id = ids;
								}
								if (names.length > 0) {
									qs.name = names;
								}
								if (igdb.length > 0) {
									qs.igdb_id = igdb;
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
