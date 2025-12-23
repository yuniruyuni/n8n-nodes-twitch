import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchBitsLeaderboard implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Bits Leaderboard',
		name: 'twitchBitsLeaderboard',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		description: 'Get the Bits leaderboard for a Twitch channel',
		defaults: {
			name: 'Twitch Bits Leaderboard',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['clientCredentials'],
					},
				},
			},
			{
				name: 'twitchOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
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
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Client Credentials',
						value: 'clientCredentials',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
										const userId = this.getNodeParameter('userId', 0) as string;

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
										if (userId && userId.trim() !== '') {
											qs.user_id = userId.trim();
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
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
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
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Started At',
				name: 'startedAt',
				type: 'dateTime',
				default: '',
				placeholder: 'e.g. 2024-01-01T00:00:00Z',
				description: 'Timestamp for the period start (RFC3339 format)',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123456789',
				description: 'Filter results to a specific user ID',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
			},
		],
	};
}
