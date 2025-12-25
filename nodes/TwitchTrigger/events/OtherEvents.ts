import type { INodeProperties } from 'n8n-workflow';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Drop entitlement grant event
const dropEntitlementFields: INodeProperties[] = [
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 9001',
		description: 'The organization ID for drop entitlements',
	},
	{
		displayName: 'Category ID',
		name: 'categoryId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 9002',
		description: 'Optional category/game ID to filter drops',
	},
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'string',
		default: '',
		placeholder: 'e.g. 9003',
		description: 'Optional campaign ID to filter drops',
	},
];

// Extension bits transaction event
const extensionClientIdField: INodeProperties[] = [
	{
		displayName: 'Extension Client ID',
		name: 'extensionClientId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. deadbeef',
	},
];

// Conduit shard disabled event
const conduitClientIdField: INodeProperties[] = [
	{
		displayName: 'Client ID',
		name: 'clientId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. uo6dggojyb8d6soh92zknwmi5ej1q2',
		description: 'The client ID for conduit events',
	},
];

export const otherEventOptions = [
	{ name: 'Conduit Shard Disabled', value: 'conduit.shard.disabled' },
	{ name: 'Drop Entitlement Grant', value: 'drop.entitlement.grant' },
	{ name: 'Extension Bits Transaction Create', value: 'extension.bits_transaction.create' },
];

export const otherEventFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { event: ['drop.entitlement.grant'] } }, dropEntitlementFields),
	...updateDisplayOptions(
		{ show: { event: ['extension.bits_transaction.create'] } },
		extensionClientIdField,
	),
	...updateDisplayOptions({ show: { event: ['conduit.shard.disabled'] } }, conduitClientIdField),
];

export const DROP_ENTITLEMENT_EVENTS = ['drop.entitlement.grant'];
export const EXTENSION_EVENTS = ['extension.bits_transaction.create'];
export const CONDUIT_EVENTS = ['conduit.shard.disabled'];
