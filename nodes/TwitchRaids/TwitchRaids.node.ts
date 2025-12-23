import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchRaids implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Raids',
		name: 'twitchRaids',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Raids API',
		defaults: {
			name: 'Twitch Raids',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['clientCredentials'],
					},
				},
			},
			{
				name: 'twitchOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
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
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Client Credentials',
						value: 'clientCredentials',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Start Raid',
						value: 'startRaid',
						action: 'Start a raid',
						description: 'Start a raid from one broadcaster to another',
						routing: {
							request: {
								method: 'POST',
								url: '/raids',
								qs: {
									from_broadcaster_id: '={{$parameter.fromBroadcasterId}}',
									to_broadcaster_id: '={{$parameter.toBroadcasterId}}',
								},
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
									{
										type: 'setKeyValue',
										properties: {
											index: 0,
										},
									},
								],
							},
						},
					},
					{
						name: 'Cancel Raid',
						value: 'cancelRaid',
						action: 'Cancel a raid',
						description: 'Cancel a pending raid',
						routing: {
							request: {
								method: 'DELETE',
								url: '/raids',
								qs: {
									broadcaster_id: '={{$parameter.broadcasterId}}',
								},
							},
						},
					},
				],
				default: 'startRaid',
			},
			// Start Raid Parameters
			{
				displayName: 'From Broadcaster ID',
				name: 'fromBroadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startRaid'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The ID of the broadcaster that is starting the raid (must be the authenticated user)',
			},
			{
				displayName: 'To Broadcaster ID',
				name: 'toBroadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startRaid'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 987654321',
				description: 'The ID of the broadcaster to raid',
			},
			{
				displayName: 'Note',
				name: 'startRaidNote',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: ['startRaid'],
					},
				},
				description: 'Requires OAuth2 authentication with channel:manage:raids scope. The authenticated user must match the from_broadcaster_id.',
			},
			// Cancel Raid Parameters
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['cancelRaid'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The ID of the broadcaster that initiated the raid (must be the authenticated user)',
			},
			{
				displayName: 'Note',
				name: 'cancelRaidNote',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: ['cancelRaid'],
					},
				},
				description: 'Requires OAuth2 authentication with channel:manage:raids scope. You can only cancel a raid that has not been completed.',
			},
		],
	};
}
