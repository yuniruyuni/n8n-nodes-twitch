import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export class TwitchChatMessages implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Chat Messages',
		name: 'twitchChatMessages',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		description: 'Send messages in a Twitch chat',
		defaults: {
			name: 'Twitch Chat Messages',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.twitch.tv/helix',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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

										// Resolve usernames to user IDs
										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
										const senderId = await resolveUserIdOrUsername.call(this, senderIdInput);

										requestOptions.body = {
											broadcaster_id: broadcasterId,
											sender_id: senderId,
											message: message,
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
				default: 'sendMessage',
			},
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'Sender ID or Username',
				name: 'senderId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321 or username',
				description: 'The sender user ID or username (must match the user access token). If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. Hello, Twitch!',
				description: 'The message to send. Maximum length: 500 characters.',
				typeOptions: {
					maxValue: 500,
				},
			},
		],
	};
}
