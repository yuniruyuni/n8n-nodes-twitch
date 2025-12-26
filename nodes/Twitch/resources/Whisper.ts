/**
 * Whisper Resource
 *
 * Operations for Twitch Whisper API endpoints:
 * - Send Whisper
 *
 * @see https://dev.twitch.tv/docs/api/reference#send-whisper
 */

import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const sendWhisperFields: INodeProperties[] = [
	{
		displayName: 'From User',
		name: 'fromUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'User ID or login name of the user sending the whisper. If a login name is provided, it will be automatically converted to user ID. This user must have a verified phone number. This ID must match the user ID in the OAuth2 access token.',
	},
	{
		displayName: 'To User',
		name: 'toUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 987654321 or torpedo09',
		description: 'User ID or login name of the user to receive the whisper. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Hello from n8n!',
		description: 'The whisper message to send. Must not be empty. Maximum 500 characters if recipient hasn\'t whispered before, 10,000 characters if they have. Messages exceeding the limit are truncated.',
	},
];

export const whisperOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['whisper'],
			},
		},
		options: [
			{
				name: 'Send Whisper',
				value: 'sendWhisper',
				action: 'Send a whisper',
				description: 'Send a whisper message to a user',
				routing: {
					request: {
						method: 'POST',
						url: '/whispers',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const fromUserIdInput = this.getNodeParameter('fromUserId', 0) as string;
								const fromUserId = await resolveUserIdOrLogin.call(this, fromUserIdInput);
								const toUserIdInput = this.getNodeParameter('toUserId', 0) as string;
								const toUserId = await resolveUserIdOrLogin.call(this, toUserIdInput);
								const message = this.getNodeParameter('message', 0) as string;

								requestOptions.qs = {
									from_user_id: fromUserId,
									to_user_id: toUserId,
								};

								requestOptions.body = {
									message,
								};

								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'sendWhisper',
	},
];

export const whisperFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['whisper'], operation: ['sendWhisper'] } }, sendWhisperFields),
];
