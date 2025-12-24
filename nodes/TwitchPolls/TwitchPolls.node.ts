import { NodeConnectionTypes, type IDataObject, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class TwitchPolls implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Polls',
		name: 'twitchPolls',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Twitch Polls API',
		defaults: {
			name: 'Twitch Polls',
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
						name: 'Create Poll',
						value: 'createPoll',
						action: 'Create a poll',
						description: 'Create a poll for a broadcaster',
						routing: {
							request: {
								method: 'POST',
								url: '/polls',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('broadcasterId', 0) as string;
										const title = this.getNodeParameter('title', 0) as string;
										const choicesInput = this.getNodeParameter('choices', 0) as string;
										const duration = this.getNodeParameter('duration', 0) as number;

										// Parse choices - can be comma-separated or JSON array
										let choices: string[];
										try {
											// Try to parse as JSON array first
											choices = JSON.parse(choicesInput);
											if (!Array.isArray(choices)) {
												choices = [choicesInput];
											}
										} catch {
											// If not JSON, split by comma
											choices = choicesInput.split(',').map(c => c.trim()).filter(c => c);
										}

										// Build choices array in required format
										const formattedChoices = choices.map(choice => ({ title: choice }));

										const body: IDataObject = {
											broadcaster_id: broadcasterId,
											title: title,
											choices: formattedChoices,
											duration: duration,
										};

										// Add optional fields
										const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

										if (additionalFields.bitsVotingEnabled !== undefined) {
											body.bits_voting_enabled = additionalFields.bitsVotingEnabled;
										}
										if (additionalFields.bitsPerVote !== undefined) {
											body.bits_per_vote = additionalFields.bitsPerVote;
										}
										if (additionalFields.channelPointsVotingEnabled !== undefined) {
											body.channel_points_voting_enabled = additionalFields.channelPointsVotingEnabled;
										}
										if (additionalFields.channelPointsPerVote !== undefined) {
											body.channel_points_per_vote = additionalFields.channelPointsPerVote;
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
						name: 'Get Polls',
						value: 'getPolls',
						action: 'Get polls',
						description: 'Get polls for a broadcaster',
						routing: {
							request: {
								method: 'GET',
								url: '/polls',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('getBroadcasterId', 0) as string;
										const qs: IDataObject = {
											broadcaster_id: broadcasterId,
										};

										// Add optional parameters
										const pollIds = this.getNodeParameter('pollIds', 0) as string;
										if (pollIds) {
											qs.id = pollIds;
										}

										const first = this.getNodeParameter('first', 0) as number;
										if (first) {
											qs.first = first;
										}

										requestOptions.qs = qs;
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
						name: 'End Poll',
						value: 'endPoll',
						action: 'End a poll',
						description: 'End an active poll',
						routing: {
							request: {
								method: 'PATCH',
								url: '/polls',
							},
							send: {
								preSend: [
									async function (this, requestOptions) {
										const broadcasterId = this.getNodeParameter('endBroadcasterId', 0) as string;
										const pollId = this.getNodeParameter('pollId', 0) as string;
										const status = this.getNodeParameter('status', 0) as string;

										const body: IDataObject = {
											broadcaster_id: broadcasterId,
											id: pollId,
											status: status,
										};

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
				default: 'getPolls',
			},
			// Create Poll Parameters
			{
				displayName: 'Broadcaster ID',
				name: 'broadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createPoll'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID who will own the poll',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createPoll'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. What game should I play next?',
				description: 'Question displayed for the poll. Maximum: 60 characters.',
			},
			{
				displayName: 'Choices',
				name: 'choices',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createPoll'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. ["Option 1", "Option 2", "Option 3"] or Option 1, Option 2, Option 3',
				description: 'Poll choices as a JSON array or comma-separated list. Minimum: 2 choices. Maximum: 5 choices. Each choice maximum: 25 characters.',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['createPoll'],
					},
				},
				default: 300,
				required: true,
				typeOptions: {
					minValue: 15,
					maxValue: 1800,
				},
				description: 'Total duration for the poll in seconds. Minimum: 15. Maximum: 1800.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['createPoll'],
					},
				},
				options: [
					{
						displayName: 'Bits Voting Enabled',
						name: 'bitsVotingEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether viewers can cast additional votes using Bits',
					},
					{
						displayName: 'Bits Per Vote',
						name: 'bitsPerVote',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: 0,
							maxValue: 10000,
						},
						description: 'Number of Bits required to vote once with Bits. Minimum: 0. Maximum: 10000.',
					},
					{
						displayName: 'Channel Points Voting Enabled',
						name: 'channelPointsVotingEnabled',
						type: 'boolean',
						default: false,
						description: 'Whether viewers can cast additional votes using Channel Points',
					},
					{
						displayName: 'Channel Points Per Vote',
						name: 'channelPointsPerVote',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: 0,
							maxValue: 1000000,
						},
						description: 'Number of Channel Points required to vote once with Channel Points. Minimum: 0. Maximum: 1000000.',
					},
				],
			},
			// Get Polls Parameters
			{
				displayName: 'Broadcaster ID',
				name: 'getBroadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getPolls'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID whose polls to retrieve',
			},
			{
				displayName: 'Poll IDs',
				name: 'pollIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getPolls'],
					},
				},
				default: '',
				placeholder: 'e.g. poll-ID-1 or poll-ID-1,poll-ID-2',
				description: 'Filter by poll ID(s). Separate multiple IDs with commas. Maximum: 100 IDs. Leave empty to get all polls.',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getPolls'],
					},
				},
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 20,
				},
				description: 'Maximum number of polls to return. Default: 20. Maximum: 20.',
			},
			// End Poll Parameters
			{
				displayName: 'Broadcaster ID',
				name: 'endBroadcasterId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['endPoll'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. 123456789',
				description: 'The broadcaster user ID who owns the poll',
			},
			{
				displayName: 'Poll ID',
				name: 'pollId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['endPoll'],
					},
				},
				default: '',
				required: true,
				placeholder: 'e.g. ed961efd-8a3f-4cf5-a9d0-e616c590cd2a',
				description: 'The ID of the poll to end',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['endPoll'],
					},
				},
				options: [
					{
						name: 'Terminated',
						value: 'TERMINATED',
						description: 'End the poll immediately',
					},
					{
						name: 'Archived',
						value: 'ARCHIVED',
						description: 'Archive the poll immediately',
					},
				],
				default: 'TERMINATED',
				required: true,
				description: 'The status to set for the poll when ending it',
			},
			{
				displayName: 'Note',
				name: 'pollsNote',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: ['createPoll', 'endPoll'],
					},
				},
				description: 'Requires OAuth2 authentication with channel:manage:polls scope',
			},
		],
	};
}
