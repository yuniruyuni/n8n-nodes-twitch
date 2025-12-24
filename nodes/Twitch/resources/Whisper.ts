import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const sendWhisperFields: INodeProperties[] = [
	{
		displayName: 'From User ID',
		name: 'fromUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 123456789',
		description: 'The ID of the user sending the whisper. This user must have a verified phone number. This ID must match the user ID in the OAuth2 access token.',
	},
	{
		displayName: 'To User ID',
		name: 'toUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 987654321',
		description: 'The ID of the user to receive the whisper',
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
								const fromUserId = this.getNodeParameter('fromUserId', 0) as string;
								const toUserId = this.getNodeParameter('toUserId', 0) as string;
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
