import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchTeams implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Teams',
		name: 'twitchTeams',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Teams API',
		defaults: {
			name: 'Twitch Teams',
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
						name: 'Get Channel Teams',
						value: 'getChannelTeams',
						action: 'Get channel teams',
						description: 'Get all teams that a broadcaster is a member of',
						routing: {
							request: {
								method: 'GET',
								url: '/teams/channel',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;

										requestOptions.qs = {
											broadcaster_id: broadcasterId,
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
					{
						name: 'Get Team',
						value: 'getTeam',
						action: 'Get team',
						description: 'Get information about a specific team',
						routing: {
							request: {
								method: 'GET',
								url: '/teams',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const searchBy = this.getNodeParameter('searchBy', 0) as string;
										const searchValue = this.getNodeParameter(searchBy, 0) as string;

										requestOptions.qs = {
											[searchBy]: searchValue,
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
				],
				default: 'getChannelTeams',
			},
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789',
				description: 'The ID of the broadcaster',
				displayOptions: {
					show: {
						operation: ['getChannelTeams'],
					},
				},
			},
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				required: true,
				options: [
					{
						name: 'Name',
						value: 'name',
					},
					{
						name: 'ID',
						value: 'id',
					},
				],
				default: 'name',
				description: 'Search team by name or ID',
				displayOptions: {
					show: {
						operation: ['getTeam'],
					},
				},
			},
			{
				displayName: 'Team Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. staff',
				description: 'The name of the team',
				displayOptions: {
					show: {
						operation: ['getTeam'],
						searchBy: ['name'],
					},
				},
			},
			{
				displayName: 'Team ID',
				name: 'id',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456',
				description: 'The ID of the team',
				displayOptions: {
					show: {
						operation: ['getTeam'],
						searchBy: ['id'],
					},
				},
			},
		],
	};
}
