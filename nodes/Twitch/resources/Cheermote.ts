/**
 * Cheermote Resource
 *
 * Operations for Twitch Cheermote API endpoints:
 * - Get Cheermotes
 *
 * @see https://dev.twitch.tv/docs/api/reference#get-cheermotes
 */

import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';

export const cheermoteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['cheermote'],
			},
		},
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
									const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
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
];

export const cheermoteFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		placeholder: 'Enter broadcaster username or ID',
		description:
			'Broadcaster user ID or login name whose custom Cheermotes you want to get. If not specified, the response contains only global Cheermotes. If specified and the broadcaster uploaded Cheermotes, they will be included in the response.',
		displayOptions: {
			show: {
				resource: ['cheermote'],
				operation: ['get'],
			},
		},
	},
];
