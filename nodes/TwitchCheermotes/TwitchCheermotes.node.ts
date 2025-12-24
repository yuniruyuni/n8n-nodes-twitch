import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export class TwitchCheermotes implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Cheermotes',
		name: 'twitchCheermotes',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Get Cheermotes for a Twitch channel',
		defaults: {
			name: 'Twitch Cheermotes',
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
						name: 'Get',
						value: 'get',
						action: 'Get cheermotes',
						description: 'Get the list of Cheermotes (animated emotes used with Bits)',
						routing: {
							request: {
								method: 'GET',
								url: '/bits/cheermotes',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', '') as string;

										if (broadcasterIdInput) {
											const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
											requestOptions.qs = {
												broadcaster_id: broadcasterId,
											};
										}

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
				default: 'get',
			},
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If omitted, returns global cheermotes. If a username is provided, it will be automatically converted to user ID.',
			},
		],
	};
}
