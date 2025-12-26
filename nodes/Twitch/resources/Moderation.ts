import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Shared parameter definitions
const sharedBroadcasterIdField: INodeProperties = {
	displayName: 'Broadcaster',
	name: 'broadcasterId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 123456789 or torpedo09',
	description: 'Broadcaster user ID or login name. Usernames will be automatically converted to user IDs.',
};

const sharedModeratorIdField: INodeProperties = {
	displayName: 'Moderator',
	name: 'moderatorId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 987654321 or moderator_name',
	description: 'Moderator user ID or login name. This must match the user in the access token. Usernames will be automatically converted to user IDs.',
};

const sharedUserIdField: INodeProperties = {
	displayName: 'User',
	name: 'userId',
	type: 'string',
	default: '',
	required: true,
	placeholder: 'e.g. 555666777 or torpedo09',
	description: 'User ID or login name. Usernames will be automatically converted to user IDs.',
};

// Field definitions for Check AutoMod Status
const checkAutoModStatusFields: INodeProperties[] = [
	{
		displayName: 'Messages',
		name: 'messages',
		type: 'string',
		default: '',
		required: true,
		typeOptions: {
			rows: 4,
		},
		placeholder: 'e.g. [{"msg_id":"123","msg_text":"Hello World!"}]',
		description: 'JSON array of messages to check. Each message must have msg_id (caller-defined ID) and msg_text (message text). Maximum 100 messages.',
	},
];

// Field definitions for Manage Held AutoMod Messages
const manageHeldAutoModMessagesFields: INodeProperties[] = [
	{
		displayName: 'Message',
		name: 'msgId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 836013710',
		description: 'Message ID. ID of the message to allow or deny.',
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		default: 'ALLOW',
		required: true,
		options: [
			{ name: 'Allow', value: 'ALLOW' },
			{ name: 'Deny', value: 'DENY' },
		],
		description: 'The action to take for the message',
	},
];

// Field definitions for Update AutoMod Settings
const updateAutoModSettingsFields: INodeProperties[] = [
	{
		displayName: 'Settings Type',
		name: 'settingsType',
		type: 'options',
		default: 'overall',
		required: true,
		options: [
			{ name: 'Overall Level', value: 'overall' },
			{ name: 'Individual Settings', value: 'individual' },
		],
		description: 'Choose to set overall level or individual settings. You may set either overall_level or individual settings, but not both.',
	},
	{
		displayName: 'Overall Level',
		name: 'overallLevel',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['overall'],
			},
		},
		default: 0,
		required: true,
		placeholder: 'e.g. 2',
		description: 'The default AutoMod level (0-4). 0 = no filtering, 4 = most aggressive filtering.',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Aggression',
		name: 'aggression',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for hostility involving aggression (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Bullying',
		name: 'bullying',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for hostility involving name calling or insults (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Disability',
		name: 'disability',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for discrimination against disability (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Misogyny',
		name: 'misogyny',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for discrimination against women (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Race, Ethnicity, or Religion',
		name: 'raceEthnicityOrReligion',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for racial discrimination (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Sex Based Terms',
		name: 'sexBasedTerms',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for sexual content (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Sexuality, Sex, or Gender',
		name: 'sexualitySexOrGender',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The AutoMod level for discrimination based on sexuality, sex, or gender (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
	{
		displayName: 'Swearing',
		name: 'swearing',
		type: 'number',
		displayOptions: {
			show: {
				settingsType: ['individual'],
			},
		},
		default: 0,
		placeholder: 'e.g. 2',
		description: 'The Automod level for profanity (0-4)',
		typeOptions: {
			minValue: 0,
			maxValue: 4,
		},
	},
];

// Field definitions for Get Blocked Terms
const getBlockedTermsFields: INodeProperties[] = [
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		placeholder: 'e.g. 20',
		description: 'The maximum number of items to return per page (1-100, default: 20)',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxs...',
		description: 'The cursor for pagination (to get the next page of results)',
	},
];

// Field definitions for Add Blocked Term
const addBlockedTermFields: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. inappropriate_word or *badword',
		description: 'The word or phrase to block (2-500 characters). May include wildcard (*) at beginning or end.',
	},
];

// Field definitions for Remove Blocked Term
const removeBlockedTermFields: INodeProperties[] = [
	{
		displayName: 'Blocked Term',
		name: 'blockedTermId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 520e4d4e-0cda-49c7-821e-e5ef4f88c2f2',
		description: 'The ID of the blocked term to remove',
	},
];

// Field definitions for Delete Chat Messages
const deleteChatMessagesFields: INodeProperties[] = [
	{
		displayName: 'Message',
		name: 'messageId',
		type: 'string',
		default: '',
		placeholder: 'e.g. abc-123-def',
		description: 'Message ID. ID of the message to remove. If not specified, all messages in the chat room will be deleted.',
	},
];

// Field definitions for Update Shield Mode Status
const updateShieldModeStatusFields: INodeProperties[] = [
	{
		displayName: 'Is Active',
		name: 'isActive',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Whether to activate or deactivate Shield Mode',
	},
];

// Field definitions for Warn Chat User
const warnChatUserFields: INodeProperties[] = [
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. stop doing that!',
		description: 'The reason for the warning (max 500 characters)',
	},
];

export const moderationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['moderation'],
			},
		},
		options: [
			{
				name: 'Check AutoMod Status',
				value: 'checkAutoModStatus',
				action: 'Check if auto mod would flag messages',
				description: 'Check whether AutoMod would flag specified messages for review',
				routing: {
					request: {
						method: 'POST',
						url: '/moderation/enforcements/status',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);

								const messagesJson = this.getNodeParameter('messages') as string;
								let messages;
								try {
									messages = JSON.parse(messagesJson);
								} catch {
									throw new Error('Messages must be a valid JSON array');
								}

								if (!Array.isArray(messages) || messages.length === 0 || messages.length > 100) {
									throw new Error('Messages must be an array with 1-100 items');
								}

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
								};

								const body: IDataObject = {
									data: messages,
								};

								requestOptions.qs = qs;
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
				name: 'Manage Held AutoMod Message',
				value: 'manageHeldAutoModMessage',
				action: 'Allow or deny a held auto mod message',
				description: 'Allow or deny a message that AutoMod flagged for review',
				routing: {
					request: {
						method: 'POST',
						url: '/moderation/automod/message',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const userIdInput = this.getNodeParameter('userId') as string;
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);

								const body: IDataObject = {
									user_id: userId,
									msg_id: this.getNodeParameter('msgId') as string,
									action: this.getNodeParameter('action') as string,
								};

								requestOptions.body = body;
								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Get AutoMod Settings',
				value: 'getAutoModSettings',
				action: 'Get auto mod settings',
				description: 'Get the broadcaster\'s AutoMod settings',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/automod/settings',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

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
				name: 'Update AutoMod Settings',
				value: 'updateAutoModSettings',
				action: 'Update auto mod settings',
				description: 'Update the broadcaster\'s AutoMod settings',
				routing: {
					request: {
						method: 'PUT',
						url: '/moderation/automod/settings',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const settingsType = this.getNodeParameter('settingsType') as string;
								const body: IDataObject = {};

								if (settingsType === 'overall') {
									body.overall_level = this.getNodeParameter('overallLevel') as number;
								} else {
									// Individual settings
									body.aggression = this.getNodeParameter('aggression', 0) as number;
									body.bullying = this.getNodeParameter('bullying', 0) as number;
									body.disability = this.getNodeParameter('disability', 0) as number;
									body.misogyny = this.getNodeParameter('misogyny', 0) as number;
									body.race_ethnicity_or_religion = this.getNodeParameter('raceEthnicityOrReligion', 0) as number;
									body.sex_based_terms = this.getNodeParameter('sexBasedTerms', 0) as number;
									body.sexuality_sex_or_gender = this.getNodeParameter('sexualitySexOrGender', 0) as number;
									body.swearing = this.getNodeParameter('swearing', 0) as number;
								}

								requestOptions.qs = qs;
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
				name: 'Get Blocked Terms',
				value: 'getBlockedTerms',
				action: 'Get list of blocked terms',
				description: 'Get the broadcaster\'s list of blocked words or phrases',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/blocked_terms',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const first = this.getNodeParameter('first', 20) as number;
								if (first) {
									qs.first = first;
								}

								const after = this.getNodeParameter('after', '') as string;
								if (after) {
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
				name: 'Add Blocked Term',
				value: 'addBlockedTerm',
				action: 'Add a blocked term',
				description: 'Add a word or phrase to the broadcaster\'s list of blocked terms',
				routing: {
					request: {
						method: 'POST',
						url: '/moderation/blocked_terms',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const body: IDataObject = {
									text: this.getNodeParameter('text') as string,
								};

								requestOptions.qs = qs;
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
				name: 'Remove Blocked Term',
				value: 'removeBlockedTerm',
				action: 'Remove a blocked term',
				description: 'Remove a word or phrase from the broadcaster\'s list of blocked terms',
				routing: {
					request: {
						method: 'DELETE',
						url: '/moderation/blocked_terms',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
									id: this.getNodeParameter('blockedTermId') as string,
								};

								requestOptions.qs = qs;
								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Delete Chat Messages',
				value: 'deleteChatMessages',
				action: 'Delete chat messages',
				description: 'Remove a single chat message or all messages from the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'DELETE',
						url: '/moderation/chat',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const messageId = this.getNodeParameter('messageId', '') as string;
								if (messageId) {
									qs.message_id = messageId;
								}

								requestOptions.qs = qs;
								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Get Shield Mode Status',
				value: 'getShieldModeStatus',
				action: 'Get shield mode status',
				description: 'Get the broadcaster\'s Shield Mode activation status',
				routing: {
					request: {
						method: 'GET',
						url: '/moderation/shield_mode',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

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
				name: 'Update Shield Mode Status',
				value: 'updateShieldModeStatus',
				action: 'Update shield mode status',
				description: 'Activate or deactivate the broadcaster\'s Shield Mode',
				routing: {
					request: {
						method: 'PUT',
						url: '/moderation/shield_mode',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const body: IDataObject = {
									is_active: this.getNodeParameter('isActive') as boolean,
								};

								requestOptions.qs = qs;
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
				name: 'Warn Chat User',
				value: 'warnChatUser',
				action: 'Warn a chat user',
				description: 'Warn a user in the broadcaster\'s chat room',
				routing: {
					request: {
						method: 'POST',
						url: '/moderation/warnings',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
								const moderatorIdInput = this.getNodeParameter('moderatorId') as string;
								const userIdInput = this.getNodeParameter('userId') as string;

								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const moderatorId = await resolveUserIdOrLogin.call(this, moderatorIdInput);
								const userId = await resolveUserIdOrLogin.call(this, userIdInput);

								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
									moderator_id: moderatorId,
								};

								const body: IDataObject = {
									data: {
										user_id: userId,
										reason: this.getNodeParameter('reason') as string,
									},
								};

								requestOptions.qs = qs;
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
		default: 'getAutoModSettings',
	},
];

export const moderationFields: INodeProperties[] = [
	// Shared fields for operations that need broadcaster ID
	...updateDisplayOptions(
		{ show: { resource: ['moderation'], operation: [
			'checkAutoModStatus',
			'getAutoModSettings',
			'updateAutoModSettings',
			'getBlockedTerms',
			'addBlockedTerm',
			'removeBlockedTerm',
			'deleteChatMessages',
			'getShieldModeStatus',
			'updateShieldModeStatus',
			'warnChatUser',
		] } },
		[sharedBroadcasterIdField]
	),
	// Shared fields for operations that need moderator ID
	...updateDisplayOptions(
		{ show: { resource: ['moderation'], operation: [
			'getAutoModSettings',
			'updateAutoModSettings',
			'getBlockedTerms',
			'addBlockedTerm',
			'removeBlockedTerm',
			'deleteChatMessages',
			'getShieldModeStatus',
			'updateShieldModeStatus',
			'warnChatUser',
		] } },
		[sharedModeratorIdField]
	),
	// Shared fields for operations that need user ID
	...updateDisplayOptions(
		{ show: { resource: ['moderation'], operation: ['manageHeldAutoModMessage', 'warnChatUser'] } },
		[sharedUserIdField]
	),
	// Operation-specific fields
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['checkAutoModStatus'] } }, checkAutoModStatusFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['manageHeldAutoModMessage'] } }, manageHeldAutoModMessagesFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['updateAutoModSettings'] } }, updateAutoModSettingsFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['getBlockedTerms'] } }, getBlockedTermsFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['addBlockedTerm'] } }, addBlockedTermFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['removeBlockedTerm'] } }, removeBlockedTermFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['deleteChatMessages'] } }, deleteChatMessagesFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['updateShieldModeStatus'] } }, updateShieldModeStatusFields),
	...updateDisplayOptions({ show: { resource: ['moderation'], operation: ['warnChatUser'] } }, warnChatUserFields),
];
