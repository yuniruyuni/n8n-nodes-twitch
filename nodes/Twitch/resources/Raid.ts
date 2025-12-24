import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const raidOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['raid'],
			},
		},
		options: [
			{
				name: 'Start Raid',
				value: 'startRaid',
				action: 'Start a raid',
				description: 'Start a raid from one broadcaster to another',
				routing: {
					request: {
						method: 'POST',
						url: '/raids',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const fromBroadcasterIdInput = this.getNodeParameter('fromBroadcasterId') as string;
								const toBroadcasterIdInput = this.getNodeParameter('toBroadcasterId') as string;

								const fromBroadcasterId = await resolveUserIdOrUsername.call(this, fromBroadcasterIdInput);
								const toBroadcasterId = await resolveUserIdOrUsername.call(this, toBroadcasterIdInput);

								requestOptions.qs = {
									from_broadcaster_id: fromBroadcasterId,
									to_broadcaster_id: toBroadcasterId,
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
			{
				name: 'Cancel Raid',
				value: 'cancelRaid',
				action: 'Cancel a raid',
				description: 'Cancel a pending raid',
				routing: {
					request: {
						method: 'DELETE',
						url: '/raids',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
								};

								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'startRaid',
	},
];

export const raidFields: INodeProperties[] = [
	// Start Raid Parameters
	{
		displayName: 'From Broadcaster ID or Username',
		name: 'fromBroadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['raid'],
				operation: ['startRaid'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username that is starting the raid (must be the authenticated user). If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'To Broadcaster ID or Username',
		name: 'toBroadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['raid'],
				operation: ['startRaid'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 987654321 or username',
		description: 'The broadcaster user ID or username to raid. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Note',
		name: 'startRaidNote',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['raid'],
				operation: ['startRaid'],
			},
		},
		description: 'Requires OAuth2 authentication with channel:manage:raids scope. The authenticated user must match the from_broadcaster_id.',
	},
	// Cancel Raid Parameters
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['raid'],
				operation: ['cancelRaid'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username that initiated the raid (must be the authenticated user). If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Note',
		name: 'cancelRaidNote',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['raid'],
				operation: ['cancelRaid'],
			},
		},
		description: 'Requires OAuth2 authentication with channel:manage:raids scope. You can only cancel a raid that has not been completed.',
	},
];
