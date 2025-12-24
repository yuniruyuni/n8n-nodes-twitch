import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation

// Get Extension Analytics
const getExtensionAnalyticsFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'Cursor for forward pagination. Ignored if extension_id is specified.',
			},
			{
				displayName: 'Ended At',
				name: 'endedAt',
				type: 'dateTime',
				default: '',
				description: 'The reporting window\'s end date (RFC3339 format). Required if started_at is specified. Must be earlier than today minus 1-2 days.',
			},
			{
				displayName: 'Extension ID',
				name: 'extensionId',
				type: 'string',
				default: '',
				placeholder: 'e.g. abcdefgh12345678',
				description: 'The extension\'s client ID. If not specified, returns reports for all extensions owned by the authenticated user.',
			},
			{
				displayName: 'Limit',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of report URLs to return per page (1-100). Note: Response will contain at most 20 URLs per page.',
			},
			{
				displayName: 'Started At',
				name: 'startedAt',
				type: 'dateTime',
				default: '',
				description: 'The reporting window\'s start date (RFC3339 format). Must be on or after January 31, 2018. If specified, ended_at is also required.',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'overview_v2',
				options: [
					{
						name: 'Overview V2',
						value: 'overview_v2',
					},
				],
				description: 'The type of analytics report to get',
			},
		],
	},
];

// Get Game Analytics
const getGameAnalyticsFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				description: 'Cursor for forward pagination. Ignored if game_id is specified.',
			},
			{
				displayName: 'Ended At',
				name: 'endedAt',
				type: 'dateTime',
				default: '',
				description: 'The reporting window\'s end date (RFC3339 format). Required if started_at is specified. Must be earlier than today minus 1-2 days.',
			},
			{
				displayName: 'Game ID',
				name: 'gameId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 493057',
				description: 'The game\'s client ID. If not specified, returns reports for all games of the authenticated user.',
			},
			{
				displayName: 'Limit',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Maximum number of report URLs to return per page (1-100). Note: Response will contain at most 20 URLs per page.',
			},
			{
				displayName: 'Started At',
				name: 'startedAt',
				type: 'dateTime',
				default: '',
				description: 'The reporting window\'s start date (RFC3339 format). Must be within one year of today. If specified, ended_at is also required.',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'overview_v2',
				options: [
					{
						name: 'Overview V2',
						value: 'overview_v2',
					},
				],
				description: 'The type of analytics report to get',
			},
		],
	},
];

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
		options: [
			{
				name: 'Get Extension Analytics',
				value: 'getExtensionAnalytics',
				action: 'Get extension analytics',
				description: 'Get analytics report URLs for one or more extensions',
				routing: {
					request: {
						method: 'GET',
						url: '/analytics/extensions',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

								requestOptions.qs = requestOptions.qs || {};

								if (additionalFields.extensionId) {
									requestOptions.qs.extension_id = additionalFields.extensionId as string;
								}
								if (additionalFields.type) {
									requestOptions.qs.type = additionalFields.type as string;
								}
								if (additionalFields.startedAt) {
									// Convert to RFC3339 format with time portion set to zeroes
									const date = new Date(additionalFields.startedAt as string);
									const isoString = date.toISOString();
									requestOptions.qs.started_at = isoString.split('T')[0] + 'T00:00:00Z';
								}
								if (additionalFields.endedAt) {
									// Convert to RFC3339 format with time portion set to zeroes
									const date = new Date(additionalFields.endedAt as string);
									const isoString = date.toISOString();
									requestOptions.qs.ended_at = isoString.split('T')[0] + 'T00:00:00Z';
								}
								if (additionalFields.first) {
									requestOptions.qs.first = additionalFields.first as number;
								}
								if (additionalFields.after) {
									requestOptions.qs.after = additionalFields.after as string;
								}

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
				name: 'Get Game Analytics',
				value: 'getGameAnalytics',
				action: 'Get game analytics',
				description: 'Get analytics report URLs for one or more games',
				routing: {
					request: {
						method: 'GET',
						url: '/analytics/games',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

								requestOptions.qs = requestOptions.qs || {};

								if (additionalFields.gameId) {
									requestOptions.qs.game_id = additionalFields.gameId as string;
								}
								if (additionalFields.type) {
									requestOptions.qs.type = additionalFields.type as string;
								}
								if (additionalFields.startedAt) {
									// Convert to RFC3339 format with time portion set to zeroes
									const date = new Date(additionalFields.startedAt as string);
									const isoString = date.toISOString();
									requestOptions.qs.started_at = isoString.split('T')[0] + 'T00:00:00Z';
								}
								if (additionalFields.endedAt) {
									// Convert to RFC3339 format with time portion set to zeroes
									const date = new Date(additionalFields.endedAt as string);
									const isoString = date.toISOString();
									requestOptions.qs.ended_at = isoString.split('T')[0] + 'T00:00:00Z';
								}
								if (additionalFields.first) {
									requestOptions.qs.first = additionalFields.first as number;
								}
								if (additionalFields.after) {
									requestOptions.qs.after = additionalFields.after as string;
								}

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
		default: 'getExtensionAnalytics',
	},
];

export const analyticsFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['analytics'], operation: ['getExtensionAnalytics'] } }, getExtensionAnalyticsFields),
	...updateDisplayOptions({ show: { resource: ['analytics'], operation: ['getGameAnalytics'] } }, getGameAnalyticsFields),
];
