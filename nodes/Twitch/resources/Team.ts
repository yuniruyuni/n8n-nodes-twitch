import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const teamOperations: INodeProperties[] = [
	{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['team'],
			},
		},
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
										const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
										const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);

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
			}
];

export const teamFields: INodeProperties[] = [
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username. If a username is provided, it will be automatically converted to user ID.',
				displayOptions: {
					show: {
				resource: ['team'],
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
				resource: ['team'],
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
				resource: ['team'],
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
				resource: ['team'],
						operation: ['getTeam'],
						searchBy: ['id'],
					},
				},
			},
];