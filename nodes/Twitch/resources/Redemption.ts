/**
 * Redemption Resource
 *
 * Operations for Twitch Channel Points Redemption API endpoints:
 * - Get Reward Redemptions
 * - Update Redemption Status
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-custom-reward-redemption
 */

import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const getFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Reward',
		name: 'rewardId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
		description: 'Reward ID. ID of the custom reward.',
	},
	{
		displayName: 'Filter By',
		name: 'filterBy',
		type: 'options',
		options: [
			{
				name: 'Status',
				value: 'status',
				description: 'Filter redemptions by status',
			},
			{
				name: 'Redemption IDs',
				value: 'ids',
				description: 'Get specific redemptions by their IDs',
			},
		],
		default: 'status',
		description: 'Choose how to filter the redemptions',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				filterBy: ['status'],
			},
		},
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
		description: 'Filter redemptions by status. Note: Canceled and fulfilled redemptions are returned for only a few days after they\'re canceled or fulfilled.',
	},
	{
		displayName: 'Redemptions',
		name: 'redemptionIds',
		type: 'string',
		displayOptions: {
			show: {
				filterBy: ['ids'],
			},
		},
		default: '',
		placeholder: 'e.g. 17fa2df1-ad76-4804-bfa5-a40ef63efe63,5678-1234-abcd-efgh',
		description: 'Comma-separated list of redemption IDs to filter by (maximum 50 IDs)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
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
				description: 'Maximum number of redemptions to return per page (1-50, default: 20)',
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
];

const updateFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Reward',
		name: 'rewardId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
		description: 'Reward ID. ID of the custom reward.',
	},
	{
		displayName: 'Redemptions',
		name: 'redemptionIds',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 17fa2df1-ad76-4804-bfa5-a40ef63efe63,5678-1234-abcd-efgh',
		description: 'Comma-separated list of redemption IDs to update (maximum 50 IDs). You may only update redemptions that have a status of UNFULFILLED.',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Fulfilled',
				value: 'FULFILLED',
			},
			{
				name: 'Canceled',
				value: 'CANCELED',
				description: 'Setting the status to CANCELED refunds the user\'s channel points',
			},
		],
		default: 'FULFILLED',
		required: true,
		description: 'The new status to set for the redemptions',
	},
];

export const redemptionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['redemption'],
			},
		},
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
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const rewardId = this.getNodeParameter('rewardId', 0) as string;
								const filterBy = this.getNodeParameter('filterBy', 0) as string;

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									reward_id: rewardId,
								};

								// Handle filtering - either by status or by redemption IDs
								if (filterBy === 'status') {
									const status = this.getNodeParameter('status', 0) as string;
									qs.status = status;
								} else if (filterBy === 'ids') {
									const redemptionIdsInput = this.getNodeParameter('redemptionIds', 0) as string;
									const redemptionIds = redemptionIdsInput.split(',').map(id => id.trim()).filter(id => id);

									// Add multiple id parameters (API supports id=123&id=456 format)
									if (!requestOptions.qs) {
										requestOptions.qs = {};
									}
									// Store as array - n8n will handle converting to multiple query params
									(requestOptions.qs as IDataObject).id = redemptionIds;
								}

								const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

								if (additionalFields.sort) {
									qs.sort = additionalFields.sort;
								}
								if (additionalFields.first) {
									qs.first = additionalFields.first;
								}
								if (additionalFields.after) {
									qs.after = additionalFields.after;
								}

								requestOptions.qs = { ...requestOptions.qs, ...qs };
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
				description: 'Update the status of custom reward redemptions (up to 50 at once)',
				routing: {
					request: {
						method: 'PATCH',
						url: '/channel_points/custom_rewards/redemptions',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const rewardId = this.getNodeParameter('rewardId', 0) as string;
								const redemptionIdsInput = this.getNodeParameter('redemptionIds', 0) as string;
								const status = this.getNodeParameter('status', 0) as string;

								// Parse comma-separated redemption IDs
								const redemptionIds = redemptionIdsInput.split(',').map(id => id.trim()).filter(id => id);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									reward_id: rewardId,
									// Store as array - n8n will handle converting to multiple query params (id=123&id=456)
									id: redemptionIds,
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
						],
					},
				},
			},
		],
		default: 'get',
	},
];

export const redemptionFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['redemption'], operation: ['get'] } }, getFields),
	...updateDisplayOptions({ show: { resource: ['redemption'], operation: ['update'] } }, updateFields),
];
