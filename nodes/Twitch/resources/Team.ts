/**
 * Team Resource
 *
 * Operations for Twitch Team API endpoints:
 * - Get Channel Teams
 * - Get Team
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-channel-teams
 */

import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const getChannelTeamsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
];

const getTeamFields: INodeProperties[] = [
	{
		displayName: 'Search By',
		name: 'searchBy',
		type: 'options',
		required: true,
		options: [
			{
				name: 'Name',
				value: 'name',
				description: 'Search team by name',
			},
			{
				name: 'ID',
				value: 'id',
				description: 'Search team by ID',
			},
		],
		default: 'name',
		description: 'Choose whether to search by team name or team ID. These options are mutually exclusive.',
	},
	{
		displayName: 'Team Name',
		name: 'name',
		type: 'string',
		default: '',
		placeholder: 'e.g. staff',
		description: 'The name of the team',
		displayOptions: {
			show: {
				searchBy: ['name'],
			},
		},
	},
	{
		displayName: 'Team',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 123456',
		description: 'Team ID. ID of the team.',
		displayOptions: {
			show: {
				searchBy: ['id'],
			},
		},
	},
];

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
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

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
						],
					},
				},
			},
		],
		default: 'getChannelTeams',
	},
];

export const teamFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['team'], operation: ['getChannelTeams'] } }, getChannelTeamsFields),
	...updateDisplayOptions({ show: { resource: ['team'], operation: ['getTeam'] } }, getTeamFields),
];
