import { ApplicationError } from 'n8n-workflow';
import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'User IDs or Usernames',
		name: 'userIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456,789012 or username1,username2',
		description: 'Filters the list for specific VIPs. Comma-separated list of user IDs or usernames. Maximum 100.',
	},
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'Maximum number of items to return per page',
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7IkN1cnNvciI6...',
		description: 'The cursor used to get the next page of results',
	},
];

const addFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The user ID or username to give VIP status to. If a username is provided, it will be automatically converted to user ID.',
	},
];

const removeFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The user ID or username to remove VIP status from. If a username is provided, it will be automatically converted to user ID.',
	},
];

export const vipOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vip'],
			},
		},
		options: [
			{
				name: 'Get VIPs',
				value: 'get',
				action: 'Get vips in a channel',
				description: 'Get all VIPs in a broadcaster\'s channel',
				routing: {
					request: {
						method: 'GET',
						url: '/channels/vips',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const userIdsInput = this.getNodeParameter('userIds', 0) as string;
								const first = this.getNodeParameter('first', 0) as number;
								const after = this.getNodeParameter('after', 0) as string;

								if (!broadcasterIdInput || broadcasterIdInput.trim() === '') {
									throw new ApplicationError('Broadcaster ID is required');
								}

								// Validate first parameter (1-100)
								if (first < 1 || first > 100) {
									throw new ApplicationError('First parameter must be between 1 and 100');
								}

								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput.trim());

								const qs: Record<string, string | string[] | number> = {
									broadcaster_id: broadcasterId,
									first,
								};

								// Handle comma-separated user IDs
								if (userIdsInput && userIdsInput.trim() !== '') {
									const userIdList = userIdsInput.split(',').map((v) => v.trim()).filter((v) => v !== '');
									if (userIdList.length > 0) {
										// Validate maximum 100 user IDs
										if (userIdList.length > 100) {
											throw new ApplicationError('Maximum 100 user IDs allowed');
										}
										// Resolve each user ID or username
										const resolvedUserIds = await Promise.all(
											userIdList.map((id) => resolveUserIdOrUsername.call(this, id))
										);
										qs.user_id = resolvedUserIds;
									}
								}

								// Add pagination cursor if provided
								if (after && after.trim() !== '') {
									qs.after = after.trim();
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
				name: 'Add VIP',
				value: 'add',
				action: 'Add a VIP to a channel',
				description: 'Add a VIP to the broadcaster\'s channel. Rate limit: 10 VIPs per 10 seconds.',
				routing: {
					request: {
						method: 'POST',
						url: '/channels/vips',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const userIdInput = this.getNodeParameter('userId', 0) as string;

								if (!broadcasterIdInput || broadcasterIdInput.trim() === '') {
									throw new ApplicationError('Broadcaster ID is required');
								}

								if (!userIdInput || userIdInput.trim() === '') {
									throw new ApplicationError('User ID is required');
								}

								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput.trim());
								const userId = await resolveUserIdOrUsername.call(this, userIdInput.trim());

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									user_id: userId,
								};

								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ { "success": true } }}',
								},
							},
						],
					},
				},
			},
			{
				name: 'Remove VIP',
				value: 'remove',
				action: 'Remove a VIP from a channel',
				description: 'Remove a VIP from the broadcaster\'s channel. Rate limit: 10 VIPs per 10 seconds.',
				routing: {
					request: {
						method: 'DELETE',
						url: '/channels/vips',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const userIdInput = this.getNodeParameter('userId', 0) as string;

								if (!broadcasterIdInput || broadcasterIdInput.trim() === '') {
									throw new ApplicationError('Broadcaster ID is required');
								}

								if (!userIdInput || userIdInput.trim() === '') {
									throw new ApplicationError('User ID is required');
								}

								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput.trim());
								const userId = await resolveUserIdOrUsername.call(this, userIdInput.trim());

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									user_id: userId,
								};

								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ { "success": true } }}',
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

export const vipFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['vip'], operation: ['get'] } }, getFields),
	...updateDisplayOptions({ show: { resource: ['vip'], operation: ['add'] } }, addFields),
	...updateDisplayOptions({ show: { resource: ['vip'], operation: ['remove'] } }, removeFields),
];
