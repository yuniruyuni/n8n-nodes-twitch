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
import { userEventOptions, userEventFields, USER_EVENTS } from './UserEvents';

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

		// User Events
		...userEventOptions,
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
	...userEventFields,
];

// User Access Token events - events that require TwitchUserOAuth2Api
const userEventField: INodeProperties = {
	displayName: 'Event',
	name: 'event',
	type: 'options',
	noDataExpression: true,
	options: [
		// Automod Events (4)
		...automodEventOptions,

		// Channel Events - all except channel.update (37)
		...channelEventOptions.filter(opt => opt.value !== 'channel.update'),

		// Channel Chat Events (8)
		...chatEventOptions,

		// Channel Points Events (6)
		...channelPointsEventOptions,

		// Charity Events (3)
		...charityEventOptions,

		// Goal Events (3)
		...goalEventOptions,

		// Hype Train Events (3)
		...hypeTrainEventOptions,

		// Poll Events (3)
		...pollEventOptions,

		// Prediction Events (4)
		...predictionEventOptions,

		// User Events - only user.whisper.message for User (1)
		{ name: 'User Whisper Message', value: 'user.whisper.message' },
	],
	default: 'user.whisper.message',
	description: 'The EventSub event to listen for (User Access Token events)',
};

// Export User trigger properties (for TwitchUserTrigger node)
export const userTriggerProperties: INodeProperties[] = [
	userEventField,
	...automodEventFields,
	...channelEventFields,
	...chatEventFields,
	...channelPointsEventFields,
	...charityEventFields,
	...goalEventFields,
	...hypeTrainEventFields,
	...pollEventFields,
	...predictionEventFields,
	...userEventFields,
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
];

export const MODERATOR_EVENTS = [...AUTOMOD_EVENTS, ...CHANNEL_MODERATOR_EVENTS];

export const CHAT_USER_EVENTS = CHAT_EVENTS;

export const REWARD_EVENTS = CHANNEL_POINTS_REWARD_EVENTS;

export { USER_EVENTS };
