import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getEventsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The ID of the broadcaster that\'s running the Hype Train. This ID must match the User ID in the user access token.',
	},
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 1,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'The maximum number of items to return per page in the response (1-100). Default is 1.',
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6MjB9fQ',
		description: 'Cursor for forward pagination. Get this from the pagination object in the previous response.',
	},
];

const getStatusFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The User ID of the channel broadcaster',
	},
];

export const hypeTrainOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['hypeTrain'],
			},
		},
		options: [
			{
				name: 'Get Events',
				value: 'getEvents',
				action: 'Get hype train events',
				description: 'Get information about the broadcaster\'s current or most recent Hype Train event (DEPRECATED - use Get Status instead)',
				routing: {
					request: {
						method: 'GET',
						url: '/hypetrain/events',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								const qs: {
									broadcaster_id: string;
									first?: number;
									after?: string;
								} = {
									broadcaster_id: broadcasterId,
								};

								const first = this.getNodeParameter('first', 1) as number;
								if (first !== 1) {
									qs.first = first;
								}

								const after = this.getNodeParameter('after', '') as string;
								if (after !== '') {
									qs.after = after;
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
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get hype train status',
				description: 'Get the status of a Hype Train for the specified broadcaster',
				routing: {
					request: {
						method: 'GET',
						url: '/hypetrain/status',
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
		default: 'getStatus',
	},
];

export const hypeTrainFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['hypeTrain'], operation: ['getEvents'] } }, getEventsFields),
	...updateDisplayOptions({ show: { resource: ['hypeTrain'], operation: ['getStatus'] } }, getStatusFields),
];
