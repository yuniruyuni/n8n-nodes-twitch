import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

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
										const broadcasterId = this.getNodeParameter('broadcasterId') as string;
										const senderId = this.getNodeParameter('senderId') as string;
										const message = this.getNodeParameter('message') as string;

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
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The ID of the broadcaster whose chat room you want to send a message to',
			},
			{
				displayName: 'Sender ID',
				name: 'senderId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['sendMessage'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321',
				description: 'The ID of the user sending the message. This ID must match the user ID in the user access token.',
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
