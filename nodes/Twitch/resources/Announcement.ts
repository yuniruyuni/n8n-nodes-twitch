import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const sendFields: INodeProperties[] = [
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Important announcement!',
		description: 'The announcement message (max 500 characters)',
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'options',
		options: [
			{
				name: 'Blue',
				value: 'blue',
			},
			{
				name: 'Green',
				value: 'green',
			},
			{
				name: 'Orange',
				value: 'orange',
			},
			{
				name: 'Primary',
				value: 'primary',
			},
			{
				name: 'Purple',
				value: 'purple',
			},
		],
		default: 'primary',
		description: 'The color of the announcement',
	},
];

export const announcementOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['announcement'],
			},
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				action: 'Send an announcement',
				description: 'Send an announcement to the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'POST',
						url: '/chat/announcements',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const message = this.getNodeParameter('message') as string;
								const color = this.getNodeParameter('color', 'primary') as string;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrUsername.call(this, moderatorIdInput);

								requestOptions.qs = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								requestOptions.body = {
									message,
									color,
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
		default: 'send',
	},
];

export const announcementFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['announcement'], operation: ['send'] } }, sendFields),
];