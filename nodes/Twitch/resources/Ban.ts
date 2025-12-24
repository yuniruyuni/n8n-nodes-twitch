import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

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
		description: 'Comma-separated list of user IDs or usernames to filter results. Usernames will be automatically converted to user IDs.',
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
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrUsername.call(this, moderatorIdInput);
								const userId = await resolveUserIdOrUsername.call(this, userIdInput);

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
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrUsername.call(this, moderatorIdInput);
								const userId = await resolveUserIdOrUsername.call(this, userIdInput);

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
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
								};

								const userIds = this.getNodeParameter('userIds', '') as string;
								if (userIds) {
									// Split comma-separated user IDs/usernames and resolve each
									const userIdInputs = userIds.split(',').map(id => id.trim()).filter(id => id);
									if (userIdInputs.length > 0) {
										const resolvedUserIds = await Promise.all(
											userIdInputs.map(input => resolveUserIdOrUsername.call(this, input))
										);
										qs.user_id = resolvedUserIds;
									}
								}

								const first = this.getNodeParameter('first', 20) as number;
								if (first) {
									qs.first = first;
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
	...updateDisplayOptions({ show: { resource: ['ban'], operation: ['banUser'] } }, banUserFields),
	...updateDisplayOptions({ show: { resource: ['ban'], operation: ['getBannedUsers'] } }, getBannedUsersFields),
];
