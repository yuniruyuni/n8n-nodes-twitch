import type { INodeProperties, IDataObject } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const createPollFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. What game should I play next?',
		description: 'Question displayed for the poll. Maximum: 60 characters.',
	},
	{
		displayName: 'Choices',
		name: 'choices',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. ["Option 1", "Option 2", "Option 3"] or Option 1, Option 2, Option 3',
		description: 'Poll choices as a JSON array or comma-separated list',
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
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
		options: [
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
				description: 'Number of Channel Points required to vote once',
			},
		],
	},
	{
		displayName: 'Note',
		name: 'pollsNote',
		type: 'notice',
		default: '',
		description: 'Requires OAuth2 authentication with channel:manage:polls scope',
	},
];

const getPollsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'getBroadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username whose polls to retrieve',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Poll IDs',
				name: 'pollIds',
				type: 'string',
				default: '',
				placeholder: 'e.g. poll-ID-1 or poll-ID-1,poll-ID-2',
				description: 'Filter by poll ID(s). Separate multiple IDs with commas. Maximum 20 IDs.',
			},
			{
				displayName: 'First',
				name: 'first',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 20,
				},
				description: 'Maximum number of items to return per page. Default: 20.',
			},
			{
				displayName: 'After',
				name: 'after',
				type: 'string',
				default: '',
				placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6NX19',
				description: 'Cursor for pagination. Use the cursor from the previous response to get the next page.',
			},
		],
	},
];

const endPollFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster ID or Username',
		name: 'endBroadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or username who owns the poll',
	},
	{
		displayName: 'Poll ID',
		name: 'pollId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. ed961efd-8a3f-4cf5-a9d0-e616c590cd2a',
		description: 'The ID of the poll to end',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
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
		description: 'Requires OAuth2 authentication with channel:manage:polls scope',
	},
];

export const pollOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['poll'],
			},
		},
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
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const title = this.getNodeParameter('title', 0) as string;
								const choicesInput = this.getNodeParameter('choices', 0) as string;
								const duration = this.getNodeParameter('duration', 0) as number;

								// Parse choices - can be comma-separated or JSON array
								let choices: string[];
								try {
									choices = JSON.parse(choicesInput);
									if (!Array.isArray(choices)) {
										choices = [choicesInput];
									}
								} catch {
									choices = choicesInput.split(',').map(c => c.trim()).filter(c => c);
								}

								const formattedChoices = choices.map(choice => ({ title: choice }));

								const body: IDataObject = {
									broadcaster_id: broadcasterId,
									title: title,
									choices: formattedChoices,
									duration: duration,
								};

								const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

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
								const broadcasterIdInput = this.getNodeParameter('getBroadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
								};

								const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

								if (additionalFields.pollIds) {
									qs.id = additionalFields.pollIds;
								}

								if (additionalFields.first) {
									qs.first = additionalFields.first;
								}

								if (additionalFields.after) {
									qs.after = additionalFields.after;
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
								const broadcasterIdInput = this.getNodeParameter('endBroadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
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
						],
					},
				},
			},
		],
		default: 'getPolls',
	},
];

export const pollFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['poll'], operation: ['createPoll'] } }, createPollFields),
	...updateDisplayOptions({ show: { resource: ['poll'], operation: ['getPolls'] } }, getPollsFields),
	...updateDisplayOptions({ show: { resource: ['poll'], operation: ['endPoll'] } }, endPollFields),
];
