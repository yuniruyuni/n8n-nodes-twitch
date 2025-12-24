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
		description: 'Filters the list for specific moderators. Comma-separated list of user IDs or usernames. Maximum 100.',
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

const getModeratedChannelsFields: INodeProperties[] = [
	{
		displayName: 'User ID or Username',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The user ID or username. Returns the list of channels that this user has moderator privileges in. If a username is provided, it will be automatically converted to user ID.',
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
		description: 'The user ID or username. If a username is provided, it will be automatically converted to user ID.',
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
		description: 'The user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
];

export const moderatorOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['moderator'],
			},
		},
		options: [
			{
				name: 'Get Moderators',
				value: 'get',
				action: 'Get moderators in a channel',
				description: 'Get all moderators in a broadcaster\'s channel',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/moderators',
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
				name: 'Get Moderated Channels',
				value: 'getModeratedChannels',
				action: 'Get channels where user is a moderator',
				description: 'Get a list of channels that the specified user has moderator privileges in',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/channels',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdInput = this.getNodeParameter('userId', 0) as string;
								const first = this.getNodeParameter('first', 0) as number;
								const after = this.getNodeParameter('after', 0) as string;

								if (!userIdInput || userIdInput.trim() === '') {
									throw new ApplicationError('User ID is required');
								}

								// Validate first parameter (1-100)
								if (first < 1 || first > 100) {
									throw new ApplicationError('First parameter must be between 1 and 100');
								}

								const userId = await resolveUserIdOrUsername.call(this, userIdInput.trim());

								const qs: Record<string, string | number> = {
									user_id: userId,
									first,
								};

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
				name: 'Add',
				value: 'add',
				action: 'Add a moderator to a channel',
				description: 'Add a moderator to the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'POST',
						url: '/moderation/moderators',
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
				name: 'Remove',
				value: 'remove',
				action: 'Remove a moderator from a channel',
				description: 'Remove a moderator from the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'DELETE',
						url: '/moderation/moderators',
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

export const moderatorFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['moderator'], operation: ['get'] } }, getFields),
	...updateDisplayOptions({ show: { resource: ['moderator'], operation: ['getModeratedChannels'] } }, getModeratedChannelsFields),
	...updateDisplayOptions({ show: { resource: ['moderator'], operation: ['add'] } }, addFields),
	...updateDisplayOptions({ show: { resource: ['moderator'], operation: ['remove'] } }, removeFields),
];
