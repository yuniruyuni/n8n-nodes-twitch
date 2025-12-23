import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchWhispers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Whispers',
		name: 'twitchWhispers',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Whispers API',
		defaults: {
			name: 'Twitch Whispers',
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
			{
				displayName: 'From User ID',
				name: 'fromUserId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789',
				description: 'The ID of the user sending the whisper',
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
				description: 'The whisper message to send (maximum 500 characters)',
			},
		],
	};
}
