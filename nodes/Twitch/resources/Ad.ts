/**
 * Ad Resource
 *
 * Operations for Twitch Ad API endpoints:
 * - Start Commercial
 * - Get Ad Schedule
 * - Snooze Next Ad
 *
 * @see https://dev.twitch.tv/docs/api/reference#start-commercial
 */

import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../../../shared/updateDisplayOptions';

// Field definitions for each operation
const startCommercialFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 141981764 or torpedo09',
		description: 'The ID of the partner or affiliate broadcaster that wants to run the commercial. This ID must match the user ID found in the OAuth token. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Length',
		name: 'length',
		type: 'number',
		default: 60,
		required: true,
		description: 'The length of the commercial to run, in seconds. Twitch tries to serve a commercial that\'s the requested length, but it may be shorter or longer. The maximum length you should request is 180 seconds.',
		typeOptions: {
			minValue: 30,
			maxValue: 180,
		},
	},
	{
		displayName: 'Note',
		name: 'startCommercialNote',
		type: 'notice',
		default: '',
		description: 'Requires OAuth2 authentication with channel:edit:commercial scope. Only partners and affiliates may run commercials and they must be streaming live at the time. Only the broadcaster may start a commercial; the broadcaster\'s editors and moderators may not start commercials on behalf of the broadcaster.',
	},
];

const getAdScheduleFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The broadcaster ID to get ad schedule for. This must match the user ID in the OAuth token. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Note',
		name: 'getAdScheduleNote',
		type: 'notice',
		default: '',
		description: 'Requires OAuth2 authentication with channel:read:ads scope. The user_id in the user access token must match the broadcaster_id.',
	},
];

const snoozeNextAdFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The broadcaster ID to snooze the next ad for. This must match the user ID in the OAuth token. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Note',
		name: 'snoozeNextAdNote',
		type: 'notice',
		default: '',
		description: 'Requires OAuth2 authentication with channel:manage:ads scope. The user_id in the user access token must match the broadcaster_id. If available, pushes back the timestamp of the upcoming automatic mid-roll ad by 5 minutes.',
	},
];

export const adOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ad'],
			},
		},
		options: [
			{
				name: 'Start Commercial',
				value: 'startCommercial',
				action: 'Start a commercial',
				description: 'Start a commercial on the specified channel',
				routing: {
					request: {
						method: 'POST',
						url: '/channels/commercial',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const length = this.getNodeParameter('length') as number;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								requestOptions.body = {
									broadcaster_id: broadcasterId,
									length,
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
				name: 'Get Ad Schedule',
				value: 'getAdSchedule',
				action: 'Get ad schedule',
				description: 'Get ad schedule related information including snooze, last ad, and next ad',
				routing: {
					request: {
						method: 'GET',
						url: '/channels/ads',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
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
				name: 'Snooze Next Ad',
				value: 'snoozeNextAd',
				action: 'Snooze next ad',
				description: 'Push back the timestamp of the upcoming automatic mid-roll ad by 5 minutes',
				routing: {
					request: {
						method: 'POST',
						url: '/channels/ads/schedule/snooze',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
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
		],
		default: 'getAdSchedule',
	},
];

export const adFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['ad'], operation: ['startCommercial'] } }, startCommercialFields),
	...updateDisplayOptions({ show: { resource: ['ad'], operation: ['getAdSchedule'] } }, getAdScheduleFields),
	...updateDisplayOptions({ show: { resource: ['ad'], operation: ['snoozeNextAd'] } }, snoozeNextAdFields),
];
