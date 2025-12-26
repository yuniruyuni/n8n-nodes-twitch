/**
 * Ban Resource
 *
 * Operations for Twitch Ban API endpoints:
 * - Ban User
 * - Unban User
 * - Get Banned Users
 * - Get Unban Requests
 * - Resolve Unban Request
 *
 * @see https://dev.twitch.tv/docs/api/reference#ban-user
 */

import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';
import { createLimitBasedPagination } from '../shared/pagination';

// Shared parameter definitions
const sharedBroadcasterIdField: INodeProperties = {
	displayName: 'Broadcaster',
	name: 'broadcasterId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 123456789 or torpedo09',
	description: 'Broadcaster user ID or login name. Usernames will be automatically converted to user IDs.',
};

const sharedModeratorIdField: INodeProperties = {
	displayName: 'Moderator',
	name: 'moderatorId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 987654321 or moderator_name',
	description: 'Moderator user ID or login name. This must match the user in the access token. Usernames will be automatically converted to user IDs.',
};

const sharedUserIdField: INodeProperties = {
	displayName: 'User',
	name: 'userId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 555666777 or torpedo09',
	description: 'User ID or login name. Usernames will be automatically converted to user IDs.',
};

// Field definitions for each operation
const banUserFields: INodeProperties[] = [
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: 0,
		placeholder: 'e.g. 600',
		description: 'The duration of the ban in seconds. If 0 or omitted, the ban is permanent. Max: 1,209,600 (2 weeks).',
		typeOptions: {
			minValue: 0,
			maxValue: 1209600,
		},
	},
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		default: '',
		placeholder: 'e.g. Violation of chat rules',
		description: 'The reason for the ban (max 500 characters)',
	},
];

const getBannedUsersFields: INodeProperties[] = [
	{
		displayName: 'User IDs or Usernames',
		name: 'userIds',
		type: 'string',
		default: '',
		placeholder: 'e.g. 555666777,888999000 or user1,user2',
		description: 'Comma-separated list of user IDs or usernames to filter results (max 100). Usernames will be automatically converted to user IDs.',
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
		placeholder: 'e.g. 100',
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},
];

const getUnbanRequestsFields: INodeProperties[] = [
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		default: 'pending',
		required: true,
		options: [
			{ name: 'Acknowledged', value: 'acknowledged' },
			{ name: 'Approved', value: 'approved' },
			{ name: 'Canceled', value: 'canceled' },
			{ name: 'Denied', value: 'denied' },
			{ name: 'Pending', value: 'pending' },
		],
		description: 'Filter by unban request status',
	},
	{
		displayName: 'User',
		name: 'filterUserId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'Filter by user ID or login name. Usernames will be automatically converted to user IDs.',
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
		placeholder: 'e.g. 100',
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},
];

const resolveUnbanRequestFields: INodeProperties[] = [
	{
		displayName: 'Unban Request',
		name: 'unbanRequestId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
		description: 'The ID of the unban request to resolve',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		default: 'approved',
		required: true,
		options: [
			{ name: 'Approved', value: 'approved' },
			{ name: 'Denied', value: 'denied' },
		],
		description: 'Whether to approve or deny the unban request',
	},
	{
		displayName: 'Resolution Text',
		name: 'resolutionText',
		type: 'string',
		default: '',
		placeholder: 'e.g. Request approved',
		description: 'Message supplied by the unban request resolver (max 500 characters)',
	},
];

export const banOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ban'],
			},
		},
		options: [
			{
				name: 'Ban User',
				value: 'banUser',
				action: 'Ban a user from chat',
				description: 'Ban a user from the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'POST',
						url: '/moderation/bans',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const userIdInput = this.getNodeParameter('userId') as string;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const data: IDataObject = {
									user_id: userId,
								};

								const duration = this.getNodeParameter('duration', 0) as number;
								if (duration > 0) {
									data.duration = duration;
								}

								const reason = this.getNodeParameter('reason', '') as string;
								if (reason) {
									data.reason = reason;
								}

								const body: IDataObject = {
									data,
								};

								requestOptions.qs = qs;
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
						],
					},
				},
			},
			{
				name: 'Unban User',
				value: 'unbanUser',
				action: 'Unban a user',
				description: 'Remove a ban or timeout on a user',
				routing: {
					request: {
						method: 'DELETE',
						url: '/moderation/bans',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const userIdInput = this.getNodeParameter('userId') as string;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									user_id: userId,
								};

								requestOptions.qs = qs;
								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Get Banned Users',
				value: 'getBannedUsers',
				action: 'Get list of banned users',
				description: 'Get all users banned in the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/banned',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 100 : (this.getNodeParameter('limit', 100) as number);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									// Optimal page size: API max when returnAll, otherwise min(limit, API max)
									first: returnAll ? 100 : Math.min(limit, 100),
								};

								const userIds = this.getNodeParameter('userIds', '') as string;
								if (userIds) {
									// Split comma-separated user IDs/usernames and resolve each
									const userIdInputs = userIds.split(',').map(id => id.trim()).filter(id => id);
									if (userIdInputs.length > 0) {
										const resolvedUserIds = await Promise.all(
											userIdInputs.map(input => resolveUserIdOrLogin.call(this, input))
										);
										qs.user_id = resolvedUserIds;
									}
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
				name: 'Get Unban Requests',
				value: 'getUnbanRequests',
				action: 'Get list of unban requests',
				description: 'Get a list of unban requests for a broadcaster\'s channel',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/unban_requests',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const returnAll = this.getNodeParameter('returnAll', false) as boolean;
								const limit = returnAll ? 100 : (this.getNodeParameter('limit', 100) as number);

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									status: this.getNodeParameter('status') as string,
									// Optimal page size: API max when returnAll, otherwise min(limit, API max)
									first: returnAll ? 100 : Math.min(limit, 100),
								};

								const filterUserId = this.getNodeParameter('filterUserId', '') as string;
								if (filterUserId) {
									const userId = await resolveUserIdOrLogin.call(this, filterUserId);
									qs.user_id = userId;
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
				name: 'Resolve Unban Request',
				value: 'resolveUnbanRequest',
				action: 'Resolve an unban request',
				description: 'Approve or deny an unban request',
				routing: {
					request: {
						method: 'PATCH',
						url: '/moderation/unban_requests',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									unban_request_id: this.getNodeParameter('unbanRequestId') as string,
									status: this.getNodeParameter('status') as string,
								};

								const resolutionText = this.getNodeParameter('resolutionText', '') as string;
								if (resolutionText) {
									qs.resolution_text = resolutionText;
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
		default: 'getBannedUsers',
	},
];

export const banFields: INodeProperties[] = [
	// Shared fields for operations that need broadcaster ID
	...updateDisplayOptions(
		{ show: { resource: ['ban'], operation: ['banUser', 'unbanUser', 'getBannedUsers', 'getUnbanRequests', 'resolveUnbanRequest'] } },
		[sharedBroadcasterIdField]
	),
	// Shared fields for operations that need moderator ID
	...updateDisplayOptions(
		{ show: { resource: ['ban'], operation: ['banUser', 'unbanUser', 'getUnbanRequests', 'resolveUnbanRequest'] } },
		[sharedModeratorIdField]
	),
	// Shared fields for operations that need user ID
	...updateDisplayOptions(
		{ show: { resource: ['ban'], operation: ['banUser', 'unbanUser'] } },
		[sharedUserIdField]
	),
	// Operation-specific fields
	...updateDisplayOptions({ show: { resource: ['ban'], operation: ['banUser'] } }, banUserFields),
	...updateDisplayOptions({ show: { resource: ['ban'], operation: ['getBannedUsers'] } }, getBannedUsersFields),
	...updateDisplayOptions({ show: { resource: ['ban'], operation: ['getUnbanRequests'] } }, getUnbanRequestsFields),
	...updateDisplayOptions({ show: { resource: ['ban'], operation: ['resolveUnbanRequest'] } }, resolveUnbanRequestFields),
];
