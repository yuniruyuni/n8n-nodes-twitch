import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const sendFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 12826 or torpedo09',
		description: 'The ID of the broadcaster that owns the chat room to send the announcement to. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Moderator',
		name: 'moderatorId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764 or torpedo09',
		description: 'The ID of a user who has permission to moderate the broadcaster\'s chat room, or the broadcaster\'s ID if they\'re sending the announcement. This ID must match the user ID in the user access token. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Important announcement!',
		description: 'The announcement to make in the broadcaster\'s chat room. Announcements are limited to a maximum of 500 characters; announcements longer than 500 characters are truncated.',
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
		description: 'The color used to highlight the announcement. If set to primary or not set, the channel\'s accent color is used.',
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
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

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
				},
			},
		],
		default: 'send',
	},
];

export const announcementFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['announcement'], operation: ['send'] } }, sendFields),
];