import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const getCampaignFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The ID of the broadcaster that\'s currently running a charity campaign. This ID must match the user ID in the access token.',
	},
];

const getDonationsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or torpedo09',
		description: 'The ID of the broadcaster that\'s currently running a charity campaign. This ID must match the user ID in the access token.',
	},
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		description: 'The maximum number of items to return per page in the response (1-100). Default is 20.',
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

export const charityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['charity'],
			},
		},
		options: [
			{
				name: 'Get Campaign',
				value: 'getCampaign',
				action: 'Get charity campaign',
				description: 'Get information about the charity campaign that a broadcaster is running',
				routing: {
					request: {
						method: 'GET',
						url: '/charity/campaigns',
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
				name: 'Get Donations',
				value: 'getDonations',
				action: 'Get charity campaign donations',
				description: 'Get the list of donations that users have made to the broadcaster\'s active charity campaign',
				routing: {
					request: {
						method: 'GET',
						url: '/charity/donations',
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

								const first = this.getNodeParameter('first', 20) as number;
								if (first !== 20) {
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
		],
		default: 'getCampaign',
	},
];

export const charityFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['charity'], operation: ['getCampaign'] } }, getCampaignFields),
	...updateDisplayOptions({ show: { resource: ['charity'], operation: ['getDonations'] } }, getDonationsFields),
];
