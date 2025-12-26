import type { INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const sendFields: INodeProperties[] = [
	{
		displayName: 'From Broadcaster',
		name: 'fromBroadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 12345 or torpedo09',
		description: 'The ID of the broadcaster that\'s sending the Shoutout. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'To Broadcaster',
		name: 'toBroadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 626262 or torpedo09',
		description: 'The ID of the broadcaster that\'s receiving the Shoutout. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Moderator',
		name: 'moderatorId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 98765 or torpedo09',
		description: 'The ID of the broadcaster or a user that is one of the broadcaster\'s moderators. This ID must match the user ID in the access token. If a login name is provided, it will be automatically converted to user ID.',
	},
];

export const shoutoutOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['shoutout'],
			},
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				action: 'Send a shoutout',
				description: 'Send a Shoutout to the specified broadcaster. Rate limited: once every 2 minutes, same broadcaster once every 60 minutes.',
				routing: {
					request: {
						method: 'POST',
						url: '/chat/shoutouts',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const fromBroadcasterIdInput = this.getNodeParameter('fromBroadcasterId') as string;
								const toBroadcasterIdInput = this.getNodeParameter('toBroadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								// Resolve usernames to user IDs
								const fromBroadcasterId = await resolveUserIdOrLogin.call(this, fromBroadcasterIdInput);
								const toBroadcasterId = await resolveUserIdOrLogin.call(this, toBroadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								requestOptions.qs = {
									from_broadcaster_id: fromBroadcasterId,
									to_broadcaster_id: toBroadcasterId,
									moderator_id: moderatorId,
								};

								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'send',
	},
];

export const shoutoutFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['shoutout'], operation: ['send'] } }, sendFields),
];
