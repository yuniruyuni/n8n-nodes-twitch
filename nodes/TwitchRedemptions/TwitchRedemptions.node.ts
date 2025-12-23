import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchRedemptions implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Redemptions',
		name: 'twitchRedemptions',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Get and update custom reward redemptions in a Twitch channel',
		defaults: {
			name: 'Twitch Redemptions',
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
						name: 'Get Reward Redemptions',
						value: 'get',
						action: 'Get reward redemptions',
						description: 'Get custom reward redemptions for a broadcaster',
						routing: {
							request: {
								method: 'GET',
								url: '/channel_points/custom_rewards/redemptions',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const rewardId = this.getNodeParameter('rewardId', 0) as string;

										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
											reward_id: rewardId,
										};

										const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

										if (additionalFields.status) {
											qs.status = additionalFields.status;
										}
										if (additionalFields.sort) {
											qs.sort = additionalFields.sort;
										}
										if (additionalFields.first) {
											qs.first = additionalFields.first;
										}
										if (additionalFields.after) {
											qs.after = additionalFields.after;
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
						name: 'Update Redemption Status',
						value: 'update',
						action: 'Update redemption status',
						description: 'Update the status of a custom reward redemption',
						routing: {
							request: {
								method: 'PATCH',
								url: '/channel_points/custom_rewards/redemptions',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const rewardId = this.getNodeParameter('rewardId', 0) as string;
										const redemptionId = this.getNodeParameter('redemptionId', 0) as string;
										const status = this.getNodeParameter('status', 0) as string;

										requestOptions.qs = {
											broadcaster_id: broadcasterId,
											reward_id: rewardId,
											id: redemptionId,
										};

										requestOptions.body = {
											status: status,
										};

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
			// Broadcaster ID (all operations)
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID',
			},
			// Reward ID (all operations)
			{
				displayName: 'Reward ID',
				name: 'rewardId',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
				description: 'The ID of the custom reward',
			},
			// Get operation parameters
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Unfulfilled',
								value: 'UNFULFILLED',
							},
							{
								name: 'Fulfilled',
								value: 'FULFILLED',
							},
							{
								name: 'Canceled',
								value: 'CANCELED',
							},
						],
						default: 'UNFULFILLED',
						description: 'Filter redemptions by status',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'options',
						options: [
							{
								name: 'Oldest',
								value: 'OLDEST',
							},
							{
								name: 'Newest',
								value: 'NEWEST',
							},
						],
						default: 'OLDEST',
						description: 'Sort order for redemptions',
					},
					{
						displayName: 'First',
						name: 'first',
						type: 'number',
						default: 20,
						typeOptions: {
							minValue: 1,
							maxValue: 50,
						},
						description: 'Maximum number of redemptions to return (1-50)',
					},
					{
						displayName: 'After',
						name: 'after',
						type: 'string',
						default: '',
						placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6NX19',
						description: 'Cursor for pagination',
					},
				],
			},
			// Update operation parameters
			{
				displayName: 'Redemption ID',
				name: 'redemptionId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 17fa2df1-ad76-4804-bfa5-a40ef63efe63',
				description: 'The ID of the redemption to update',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				options: [
					{
						name: 'Fulfilled',
						value: 'FULFILLED',
					},
					{
						name: 'Canceled',
						value: 'CANCELED',
					},
				],
				default: 'FULFILLED',
				required: true,
				description: 'The new status of the redemption',
			},
		],
	};
}
