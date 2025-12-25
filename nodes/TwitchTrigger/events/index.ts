import type { INodeProperties } from 'n8n-workflow';

// Import all resource event modules
import {
	automodEventOptions,
	automodEventFields,
	AUTOMOD_EVENTS,
} from './AutomodEvents';
import {
	channelEventOptions,
	channelEventFields,
	CHANNEL_BROADCASTER_ONLY_EVENTS,
	CHANNEL_MODERATOR_EVENTS,
} from './ChannelEvents';
import { chatEventOptions, chatEventFields, CHAT_EVENTS } from './ChannelChatEvents';
import {
	channelPointsEventOptions,
	channelPointsEventFields,
	CHANNEL_POINTS_AUTOMATIC_EVENTS,
	CHANNEL_POINTS_REWARD_EVENTS,
} from './ChannelPointsEvents';
import { charityEventOptions, charityEventFields, CHARITY_EVENTS } from './CharityEvents';
import { goalEventOptions, goalEventFields, GOAL_EVENTS } from './GoalEvents';
import {
	hypeTrainEventOptions,
	hypeTrainEventFields,
	HYPE_TRAIN_EVENTS,
} from './HypeTrainEvents';
import { pollEventOptions, pollEventFields, POLL_EVENTS } from './PollEvents';
import {
	predictionEventOptions,
	predictionEventFields,
	PREDICTION_EVENTS,
} from './PredictionEvents';
import { raidEventOptions, raidEventFields, RAID_EVENTS } from './RaidEvents';
import {
	sharedChatEventOptions,
	sharedChatEventFields,
	SHARED_CHAT_EVENTS,
} from './SharedChatEvents';
import { streamEventOptions, streamEventFields, STREAM_EVENTS } from './StreamEvents';
import { userEventOptions, userEventFields, USER_EVENTS } from './UserEvents';
import {
	otherEventOptions,
	otherEventFields,
	DROP_ENTITLEMENT_EVENTS,
	EXTENSION_EVENTS,
	CONDUIT_EVENTS,
} from './OtherEvents';

// Event dropdown field combining all event types
const eventField: INodeProperties = {
	displayName: 'Event',
	name: 'event',
	type: 'options',
	noDataExpression: true,
	options: [
		// Automod Events
		...automodEventOptions,

		// Channel Events
		...channelEventOptions,

		// Channel Chat Events
		...chatEventOptions,

		// Channel Points Events
		...channelPointsEventOptions,

		// Charity Events
		...charityEventOptions,

		// Goal Events
		...goalEventOptions,

		// Hype Train Events
		...hypeTrainEventOptions,

		// Poll Events
		...pollEventOptions,

		// Prediction Events
		...predictionEventOptions,

		// Raid Events
		...raidEventOptions,

		// Shared Chat Events
		...sharedChatEventOptions,

		// Stream Events
		...streamEventOptions,

		// User Events
		...userEventOptions,

		// Other Events
		...otherEventOptions,
	],
	default: '',
	description: 'The EventSub event to listen for',
};

// Export all properties with event dropdown first, then resource-specific fields
export const triggerProperties: INodeProperties[] = [
	eventField,
	...automodEventFields,
	...channelEventFields,
	...chatEventFields,
	...channelPointsEventFields,
	...charityEventFields,
	...goalEventFields,
	...hypeTrainEventFields,
	...pollEventFields,
	...predictionEventFields,
	...raidEventFields,
	...sharedChatEventFields,
	...streamEventFields,
	...userEventFields,
	...otherEventFields,
];

// Export event lists for condition building
export const BROADCASTER_ONLY_EVENTS = [
	...CHANNEL_BROADCASTER_ONLY_EVENTS,
	...CHANNEL_POINTS_AUTOMATIC_EVENTS,
	...CHARITY_EVENTS,
	...GOAL_EVENTS,
	...HYPE_TRAIN_EVENTS,
	...POLL_EVENTS,
	...PREDICTION_EVENTS,
	...SHARED_CHAT_EVENTS,
	...STREAM_EVENTS,
];

export const MODERATOR_EVENTS = [...AUTOMOD_EVENTS, ...CHANNEL_MODERATOR_EVENTS];

export const CHAT_USER_EVENTS = CHAT_EVENTS;

export const REWARD_EVENTS = CHANNEL_POINTS_REWARD_EVENTS;

export { USER_EVENTS };
export { RAID_EVENTS };
export { DROP_ENTITLEMENT_EVENTS, EXTENSION_EVENTS, CONDUIT_EVENTS };
