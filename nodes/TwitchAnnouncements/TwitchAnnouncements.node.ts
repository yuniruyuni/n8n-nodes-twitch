import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

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
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
			},
			{
				displayName: 'Moderator ID or Username',
				name: 'moderatorId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321 or username',
				description: 'The moderator user ID or username (must match the user access token). If a username is provided, it will be automatically converted to user ID.',
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
