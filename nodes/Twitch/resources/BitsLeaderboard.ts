import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getFields: INodeProperties[] = [
	{
		displayName: 'Count',
		name: 'count',
		type: 'number',
		default: 10,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		placeholder: 'e.g. 10',
		description: 'Number of results to return (1-100)',
	},
	{
		displayName: 'Period',
		name: 'period',
		type: 'options',
		options: [
			{
				name: 'All',
				value: 'all',
			},
			{
				name: 'Day',
				value: 'day',
			},
			{
				name: 'Month',
				value: 'month',
			},
			{
				name: 'Week',
				value: 'week',
			},
			{
				name: 'Year',
				value: 'year',
			},
		],
		default: 'all',
		description: 'Time period for the leaderboard',
	},
	{
		displayName: 'Started At',
		name: 'startedAt',
		type: 'dateTime',
		default: '',
		placeholder: 'e.g. 2024-01-01T00:00:00Z',
		description: 'Timestamp for the period start (RFC3339 format)',
	},
];

export const bitsLeaderboardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bitsLeaderboard'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get bits leaderboard',
				description: 'Get the Bits leaderboard for a Twitch channel',
				routing: {
					request: {
						method: 'GET',
						url: '/bits/leaderboard',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const count = this.getNodeParameter('count', 0) as number;
								const period = this.getNodeParameter('period', 0) as string;
								const startedAt = this.getNodeParameter('startedAt', 0) as string;
								const userIdInput = this.getNodeParameter('userId', 0) as string;

								const qs: IDataObject = {};

								if (count) {
									qs.count = count;
								}
								if (period) {
									qs.period = period;
								}
								if (startedAt && startedAt.trim() !== '') {
									qs.started_at = startedAt.trim();
								}
								if (userIdInput && userIdInput.trim() !== '') {
									const userId = await resolveUserIdOrUsername.call(this, userIdInput.trim());
									qs.user_id = userId;
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
		default: 'get',
	},
];

export const bitsLeaderboardFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['bitsLeaderboard'], operation: ['get'] } }, getFields),
];
