import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchAnnouncements implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Announcements',
		name: 'twitchAnnouncements',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send announcements in a Twitch channel',
		defaults: {
			name: 'Twitch Announcements',
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
										const broadcasterId = this.getNodeParameter('broadcasterId') as string;
										const moderatorId = this.getNodeParameter('moderatorId') as string;
										const message = this.getNodeParameter('message') as string;
										const color = this.getNodeParameter('color', 'primary') as string;

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
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The ID of the broadcaster whose chat room you want to send the announcement to',
			},
			{
				displayName: 'Moderator ID',
				name: 'moderatorId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321',
				description: 'The ID of the moderator sending the announcement (must match the user access token)',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. Important announcement!',
				description: 'The announcement message (max 500 characters)',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
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
		],
	};
}
