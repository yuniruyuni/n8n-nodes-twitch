import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const customRewardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customReward'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a custom reward',
				description: 'Create a custom channel points reward',
				routing: {
					request: {
						method: 'POST',
						url: '/channel_points/custom_rewards',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								requestOptions.qs = { broadcaster_id: broadcasterId };

								const body: IDataObject = {
									title: this.getNodeParameter('title', 0) as string,
									cost: this.getNodeParameter('cost', 0) as number,
								};

								const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

								if (additionalFields.prompt) {
									body.prompt = additionalFields.prompt;
								}
								if (additionalFields.isEnabled !== undefined) {
									body.is_enabled = additionalFields.isEnabled;
								}
								if (additionalFields.backgroundColor) {
									body.background_color = additionalFields.backgroundColor;
								}
								if (additionalFields.isUserInputRequired !== undefined) {
									body.is_user_input_required = additionalFields.isUserInputRequired;
								}
								if (additionalFields.isMaxPerStreamEnabled !== undefined) {
									body.is_max_per_stream_enabled = additionalFields.isMaxPerStreamEnabled;
								}
								if (additionalFields.maxPerStream) {
									body.max_per_stream = additionalFields.maxPerStream;
								}
								if (additionalFields.isMaxPerUserPerStreamEnabled !== undefined) {
									body.is_max_per_user_per_stream_enabled = additionalFields.isMaxPerUserPerStreamEnabled;
								}
								if (additionalFields.maxPerUserPerStream) {
									body.max_per_user_per_stream = additionalFields.maxPerUserPerStream;
								}
								if (additionalFields.isGlobalCooldownEnabled !== undefined) {
									body.is_global_cooldown_enabled = additionalFields.isGlobalCooldownEnabled;
								}
								if (additionalFields.globalCooldownSeconds) {
									body.global_cooldown_seconds = additionalFields.globalCooldownSeconds;
								}
								if (additionalFields.shouldRedemptionsSkipRequestQueue !== undefined) {
									body.should_redemptions_skip_request_queue = additionalFields.shouldRedemptionsSkipRequestQueue;
								}

								requestOptions.body = body;
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
			{
				name: 'Get',
				value: 'get',
				action: 'Get custom rewards',
				description: 'Get custom channel points rewards for a broadcaster',
				routing: {
					request: {
						method: 'GET',
						url: '/channel_points/custom_rewards',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const qs: IDataObject = { broadcaster_id: broadcasterId };

								const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

								if (additionalFields.id) {
									qs.id = additionalFields.id;
								}
								if (additionalFields.onlyManageableRewards !== undefined) {
									qs.only_manageable_rewards = additionalFields.onlyManageableRewards;
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
				name: 'Update',
				value: 'update',
				action: 'Update a custom reward',
				description: 'Update a custom channel points reward',
				routing: {
					request: {
						method: 'PATCH',
						url: '/channel_points/custom_rewards',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const id = this.getNodeParameter('rewardId', 0) as string;
								requestOptions.qs = { broadcaster_id: broadcasterId, id };

								const body: IDataObject = {};
								const updateFields = this.getNodeParameter('updateFields', 0, {}) as IDataObject;

								if (updateFields.title) {
									body.title = updateFields.title;
								}
								if (updateFields.cost) {
									body.cost = updateFields.cost;
								}
								if (updateFields.prompt !== undefined) {
									body.prompt = updateFields.prompt;
								}
								if (updateFields.isEnabled !== undefined) {
									body.is_enabled = updateFields.isEnabled;
								}
								if (updateFields.backgroundColor) {
									body.background_color = updateFields.backgroundColor;
								}
								if (updateFields.isUserInputRequired !== undefined) {
									body.is_user_input_required = updateFields.isUserInputRequired;
								}
								if (updateFields.isMaxPerStreamEnabled !== undefined) {
									body.is_max_per_stream_enabled = updateFields.isMaxPerStreamEnabled;
								}
								if (updateFields.maxPerStream) {
									body.max_per_stream = updateFields.maxPerStream;
								}
								if (updateFields.isMaxPerUserPerStreamEnabled !== undefined) {
									body.is_max_per_user_per_stream_enabled = updateFields.isMaxPerUserPerStreamEnabled;
								}
								if (updateFields.maxPerUserPerStream) {
									body.max_per_user_per_stream = updateFields.maxPerUserPerStream;
								}
								if (updateFields.isGlobalCooldownEnabled !== undefined) {
									body.is_global_cooldown_enabled = updateFields.isGlobalCooldownEnabled;
								}
								if (updateFields.globalCooldownSeconds) {
									body.global_cooldown_seconds = updateFields.globalCooldownSeconds;
								}
								if (updateFields.isPaused !== undefined) {
									body.is_paused = updateFields.isPaused;
								}
								if (updateFields.shouldRedemptionsSkipRequestQueue !== undefined) {
									body.should_redemptions_skip_request_queue = updateFields.shouldRedemptionsSkipRequestQueue;
								}

								requestOptions.body = body;
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
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a custom reward',
				description: 'Delete a custom channel points reward',
				routing: {
					request: {
						method: 'DELETE',
						url: '/channel_points/custom_rewards',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const id = this.getNodeParameter('rewardId', 0) as string;
								requestOptions.qs = { broadcaster_id: broadcasterId, id };
								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'get',
	},
];

export const customRewardFields: INodeProperties[] = [
	// Broadcaster ID (all operations)
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
		displayOptions: {
			show: {
				resource: ['customReward'],
			},
		},
	},
	// Create Parameters
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customReward'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. My Custom Reward',
		description: 'The custom reward title (max 45 characters)',
	},
	{
		displayName: 'Cost',
		name: 'cost',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['customReward'],
				operation: ['create'],
			},
		},
		default: 100,
		required: true,
		typeOptions: {
			minValue: 1,
		},
		description: 'The cost of the reward in channel points',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customReward'],
				operation: ['create', 'get'],
			},
		},
		options: [
			{
				displayName: 'Background Color',
				name: 'backgroundColor',
				type: 'color',
				default: '',
				placeholder: 'e.g. #9147FF',
				description: 'The background color to use for the reward (hex code)',
			},
			{
				displayName: 'Global Cooldown Seconds',
				name: 'globalCooldownSeconds',
				type: 'number',
				default: 60,
				typeOptions: {
					minValue: 1,
				},
				description: 'The cooldown in seconds',
			},
			{
				displayName: 'Is Enabled',
				name: 'isEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether the reward is enabled and can be redeemed',
			},
			{
				displayName: 'Is Global Cooldown Enabled',
				name: 'isGlobalCooldownEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether a cooldown is enabled',
			},
			{
				displayName: 'Is Max Per Stream Enabled',
				name: 'isMaxPerStreamEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether a maximum per stream is enabled',
			},
			{
				displayName: 'Is Max Per User Per Stream Enabled',
				name: 'isMaxPerUserPerStreamEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether a maximum per user per stream is enabled',
			},
			{
				displayName: 'Is User Input Required',
				name: 'isUserInputRequired',
				type: 'boolean',
				default: false,
				description: 'Whether the user needs to enter text when redeeming the reward',
			},
			{
				displayName: 'Max Per Stream',
				name: 'maxPerStream',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
				},
				description: 'The maximum number of redemptions allowed per stream',
			},
			{
				displayName: 'Max Per User Per Stream',
				name: 'maxPerUserPerStream',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
				},
				description: 'The maximum number of redemptions allowed per user per stream',
			},
			{
				displayName: 'Only Manageable Rewards',
				name: 'onlyManageableRewards',
				type: 'boolean',
				default: false,
				description: 'Whether to filter the results and only return custom rewards that the calling client_id can manage',
				displayOptions: {
					show: {
						'/operation': ['get'],
					},
				},
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: '',
				placeholder: 'e.g. Enter your message here',
				description: 'The prompt shown to the viewer when redeeming the reward (max 200 characters)',
			},
			{
				displayName: 'Reward ID',
				name: 'id',
				type: 'string',
				default: '',
				placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
				description: 'The ID of the custom reward to get (if not specified, returns all rewards)',
				displayOptions: {
					show: {
						'/operation': ['get'],
					},
				},
			},
			{
				displayName: 'Should Redemptions Skip Request Queue',
				name: 'shouldRedemptionsSkipRequestQueue',
				type: 'boolean',
				default: false,
				description: 'Whether redemptions should be automatically fulfilled',
			},
		],
	},
	// Update/Delete Parameters
	{
		displayName: 'Reward ID',
		name: 'rewardId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customReward'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
		description: 'The ID of the custom reward',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customReward'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Background Color',
				name: 'backgroundColor',
				type: 'color',
				default: '',
				placeholder: 'e.g. #9147FF',
				description: 'The background color to use for the reward (hex code)',
			},
			{
				displayName: 'Cost',
				name: 'cost',
				type: 'number',
				default: 100,
				typeOptions: {
					minValue: 1,
				},
				description: 'The cost of the reward in channel points',
			},
			{
				displayName: 'Global Cooldown Seconds',
				name: 'globalCooldownSeconds',
				type: 'number',
				default: 60,
				typeOptions: {
					minValue: 1,
				},
				description: 'The cooldown in seconds',
			},
			{
				displayName: 'Is Enabled',
				name: 'isEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether the reward is enabled and can be redeemed',
			},
			{
				displayName: 'Is Global Cooldown Enabled',
				name: 'isGlobalCooldownEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether a cooldown is enabled',
			},
			{
				displayName: 'Is Max Per Stream Enabled',
				name: 'isMaxPerStreamEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether a maximum per stream is enabled',
			},
			{
				displayName: 'Is Max Per User Per Stream Enabled',
				name: 'isMaxPerUserPerStreamEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether a maximum per user per stream is enabled',
			},
			{
				displayName: 'Is Paused',
				name: 'isPaused',
				type: 'boolean',
				default: false,
				description: 'Whether the reward is currently paused',
			},
			{
				displayName: 'Is User Input Required',
				name: 'isUserInputRequired',
				type: 'boolean',
				default: false,
				description: 'Whether the user needs to enter text when redeeming the reward',
			},
			{
				displayName: 'Max Per Stream',
				name: 'maxPerStream',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
				},
				description: 'The maximum number of redemptions allowed per stream',
			},
			{
				displayName: 'Max Per User Per Stream',
				name: 'maxPerUserPerStream',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
				},
				description: 'The maximum number of redemptions allowed per user per stream',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: '',
				placeholder: 'e.g. Enter your message here',
				description: 'The prompt shown to the viewer when redeeming the reward (max 200 characters)',
			},
			{
				displayName: 'Should Redemptions Skip Request Queue',
				name: 'shouldRedemptionsSkipRequestQueue',
				type: 'boolean',
				default: false,
				description: 'Whether redemptions should be automatically fulfilled',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				placeholder: 'e.g. Updated Reward Title',
				description: 'The custom reward title (max 45 characters)',
			},
		],
	},
];
