import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const sendMessageFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 12826 or username',
		description: 'The ID of the broadcaster whose chat room the message will be sent to. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Sender ID or Username',
		name: 'senderId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764 or username',
		description: 'The ID of the user sending the message. This ID must match the user ID in the user access token. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Hello, world! twitchdevHype',
		description: 'The message to send. The message is limited to a maximum of 500 characters. Chat messages can also include emoticons. To include emoticons, use the name of the emote (case sensitive, without colons).',
		typeOptions: {
			maxValue: 500,
		},
	},
	{
		displayName: 'Reply Parent Message',
		name: 'replyParentMessageId',
		type: 'string',
		default: '',
		placeholder: 'e.g. abc-123-def',
		description: 'The ID of the chat message being replied to',
	},
	{
		displayName: 'For Source Only',
		name: 'forSourceOnly',
		type: 'boolean',
		default: false,
		description: 'Whether to send the message only to the source channel during a shared chat session. NOTE: This parameter can only be set when using an App Access Token. It will result in an HTTP 400 error when using a User Access Token.',
	},
];

export const chatMessageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chatMessage'],
			},
		},
		options: [
			{
				name: 'Send Message',
				value: 'sendMessage',
				action: 'Send a message',
				description: 'Send a message to a Twitch chat',
				routing: {
					request: {
						method: 'POST',
						url: '/chat/messages',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const senderIdInput = this.getNodeParameter('senderId') as string;
								const message = this.getNodeParameter('message') as string;
								const replyParentMessageId = this.getNodeParameter('replyParentMessageId', '') as string;
								const forSourceOnly = this.getNodeParameter('forSourceOnly', false) as boolean;

								// Resolve usernames to user IDs
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const senderId = await resolveUserIdOrLogin.call(this, senderIdInput);

								// Build request body with required fields
								const body: {
									broadcaster_id: string;
									sender_id: string;
									message: string;
									reply_parent_message_id?: string;
									for_source_only?: boolean;
								} = {
									broadcaster_id: broadcasterId,
									sender_id: senderId,
									message: message,
								};

								// Add optional fields if provided
								if (replyParentMessageId) {
									body.reply_parent_message_id = replyParentMessageId;
								}

								// Only include for_source_only if explicitly set to true
								// (API default is false for now, changing to true on May 19, 2025)
								if (forSourceOnly) {
									body.for_source_only = forSourceOnly;
								}

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
		],
		default: 'sendMessage',
	},
];

export const chatMessageFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['chatMessage'], operation: ['sendMessage'] } }, sendMessageFields),
];
