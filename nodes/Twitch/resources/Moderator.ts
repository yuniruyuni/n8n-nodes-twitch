/**
 * Moderator Resource
 *
 * Operations for Twitch Moderator API endpoints:
 * - Get Moderators
 * - Get Moderated Channels
 * - Add Moderator
 * - Remove Moderator
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-moderators
 */

import { ApplicationError } from 'n8n-workflow';
import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { validateRequired, validateRange, parseCommaSeparated } from '../shared/validators';
import { createLimitBasedPagination } from '../shared/pagination';

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
		displayName: 'User IDs or Usernames',
		name: 'userIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456,789012 or username1,username2',
		description: 'Filters the list for specific moderators. Comma-separated list of user IDs or usernames. Maximum 100.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
	},
];

const getModeratedChannelsFields: INodeProperties[] = [
	{
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The user ID or login name. Returns the list of channels that this user has moderator privileges in. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		default: 50,
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
	},
];

const addFields: INodeProperties[] = [
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
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
];

const removeFields: INodeProperties[] = [
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
		displayName: 'User',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
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
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 1000 : (this.getNodeParameter('limit', 0) as number);

								const broadcasterIdTrimmed = validateRequired(broadcasterIdInput, 'Broadcaster ID');
								validateRange(limit, 1, Number.MAX_SAFE_INTEGER, 'Limit parameter');

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdTrimmed);

								const qs: Record<string, string | string[] | number> = {
									broadcaster_id: broadcasterId,
									// Optimal page size: API max when returnAll, otherwise min(limit, API max)
									first: returnAll ? 100 : Math.min(limit, 100),
								};

								// Handle comma-separated user IDs
								const userIdList = parseCommaSeparated(userIdsInput);
								if (userIdList.length > 0) {
									// Resolve each user ID or login name
									const resolvedUserIds = await Promise.all(
										userIdList.map((id) => resolveUserIdOrLogin.call(this, id))
									);
									qs.user_id = resolvedUserIds;
								}

								requestOptions.qs = qs;

								return requestOptions;
							},
						],
					},
					operations: {
						pagination: createLimitBasedPagination(100),
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
								type: 'limit',
								properties: {
									maxResults: '={{$parameter.returnAll ? undefined : $parameter.limit}}',
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
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 1000 : (this.getNodeParameter('limit', 0) as number);

								const userIdTrimmed = validateRequired(userIdInput, 'User ID');
								validateRange(limit, 1, Number.MAX_SAFE_INTEGER, 'Limit parameter');

								const userId = await resolveUserIdOrLogin.call(this, userIdTrimmed);

								const qs: Record<string, string | number> = {
									user_id: userId,
									// Optimal page size: API max when returnAll, otherwise min(limit, API max)
									first: returnAll ? 100 : Math.min(limit, 100),
								};

								requestOptions.qs = qs;

								return requestOptions;
							},
						],
					},
					operations: {
						pagination: createLimitBasedPagination(100),
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
								type: 'limit',
								properties: {
									maxResults: '={{$parameter.returnAll ? undefined : $parameter.limit}}',
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

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput.trim());
								const userId = await resolveUserIdOrLogin.call(this, userIdInput.trim());

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

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput.trim());
								const userId = await resolveUserIdOrLogin.call(this, userIdInput.trim());

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
