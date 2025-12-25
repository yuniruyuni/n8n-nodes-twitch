import type { INodeProperties } from 'n8n-workflow';

// Import all resource event modules (App Access Token events only)
import {
	channelEventFields,
	CHANNEL_BROADCASTER_ONLY_EVENTS,
} from './ChannelEvents';
import { raidEventOptions, raidEventFields, RAID_EVENTS } from './RaidEvents';
import {
	sharedChatEventOptions,
	sharedChatEventFields,
	SHARED_CHAT_EVENTS,
} from './SharedChatEvents';
import { streamEventOptions, streamEventFields, STREAM_EVENTS } from './StreamEvents';
import { userEventFields, USER_EVENTS } from './UserEvents';
import {
	otherEventOptions,
	otherEventFields,
	DROP_ENTITLEMENT_EVENTS,
	EXTENSION_EVENTS,
	CONDUIT_EVENTS,
} from './OtherEvents';

// App Access Token events - events that work with TwitchAppOAuth2Api
const appEventField: INodeProperties = {
	displayName: 'Event',
	name: 'event',
	type: 'options',
	noDataExpression: true,
	options: [
		// Stream Events (2)
		...streamEventOptions,

		// Raid Events (1)
		...raidEventOptions,

		// Shared Chat Events (3)
		...sharedChatEventOptions,

		// User Events - only user.update for App (1)
		{ name: 'User Update', value: 'user.update' },

		// Other Events (3)
		...otherEventOptions,

		// Channel Events - only channel.update for App (1)
		{ name: 'Channel Update', value: 'channel.update' },
	],
	default: 'user.update',
	description: 'The EventSub event to listen for (App Access Token events)',
};

// Export App trigger properties (for TwitchAppTrigger node)
export const appTriggerProperties: INodeProperties[] = [
	appEventField,
	...raidEventFields,
	...sharedChatEventFields,
	...streamEventFields,
	...userEventFields,
	...otherEventFields,
	...channelEventFields,
];

// Export event lists for condition building (App Access Token events only)
export const BROADCASTER_ONLY_EVENTS = [
	...CHANNEL_BROADCASTER_ONLY_EVENTS,
	...SHARED_CHAT_EVENTS,
	...STREAM_EVENTS,
];

export { USER_EVENTS };
export { RAID_EVENTS };
export { DROP_ENTITLEMENT_EVENTS, EXTENSION_EVENTS, CONDUIT_EVENTS };
