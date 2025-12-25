import type { EventConditionBuilder } from './types';
import { buildCondition as buildAutomodCondition, AUTOMOD_EVENTS } from './AutomodEvents';
import {
	buildCondition as buildChannelCondition,
	CHANNEL_BROADCASTER_ONLY_EVENTS,
	CHANNEL_MODERATOR_EVENTS,
} from './ChannelEvents';
import { buildCondition as buildChannelChatCondition, CHAT_EVENTS } from './ChannelChatEvents';
import {
	buildCondition as buildChannelPointsCondition,
	CHANNEL_POINTS_AUTOMATIC_EVENTS,
	CHANNEL_POINTS_REWARD_EVENTS,
} from './ChannelPointsEvents';
import { buildCondition as buildCharityCondition, CHARITY_EVENTS } from './CharityEvents';
import { buildCondition as buildGoalCondition, GOAL_EVENTS } from './GoalEvents';
import { buildCondition as buildHypeTrainCondition, HYPE_TRAIN_EVENTS } from './HypeTrainEvents';
import {
	buildCondition as buildOtherCondition,
	DROP_ENTITLEMENT_EVENTS,
	EXTENSION_EVENTS,
	CONDUIT_EVENTS,
} from './OtherEvents';
import { buildCondition as buildPollCondition, POLL_EVENTS } from './PollEvents';
import { buildCondition as buildPredictionCondition, PREDICTION_EVENTS } from './PredictionEvents';
import { buildCondition as buildRaidCondition, RAID_EVENTS } from './RaidEvents';
import {
	buildCondition as buildSharedChatCondition,
	SHARED_CHAT_EVENTS,
} from './SharedChatEvents';
import { buildCondition as buildStreamCondition, STREAM_EVENTS } from './StreamEvents';
import { buildCondition as buildUserCondition, USER_EVENTS } from './UserEvents';

/**
 * Registry mapping event names to their condition builder functions.
 * This allows TwitchTrigger.node.ts to look up the appropriate builder for each event.
 */
export const eventConditionBuilders: Map<string, EventConditionBuilder> = new Map();

// Automod events
AUTOMOD_EVENTS.forEach((event: string) =>
	eventConditionBuilders.set(event, buildAutomodCondition),
);

// Channel events
[...CHANNEL_BROADCASTER_ONLY_EVENTS, ...CHANNEL_MODERATOR_EVENTS].forEach((event: string) =>
	eventConditionBuilders.set(event, buildChannelCondition),
);

// Channel chat events
CHAT_EVENTS.forEach((event: string) =>
	eventConditionBuilders.set(event, buildChannelChatCondition),
);

// Channel points events
[...CHANNEL_POINTS_AUTOMATIC_EVENTS, ...CHANNEL_POINTS_REWARD_EVENTS].forEach((event: string) =>
	eventConditionBuilders.set(event, buildChannelPointsCondition),
);

// Charity events
CHARITY_EVENTS.forEach((event: string) =>
	eventConditionBuilders.set(event, buildCharityCondition),
);

// Goal events
GOAL_EVENTS.forEach((event: string) => eventConditionBuilders.set(event, buildGoalCondition));

// Hype train events
HYPE_TRAIN_EVENTS.forEach((event: string) =>
	eventConditionBuilders.set(event, buildHypeTrainCondition),
);

// Poll events
POLL_EVENTS.forEach((event: string) => eventConditionBuilders.set(event, buildPollCondition));

// Prediction events
PREDICTION_EVENTS.forEach((event: string) =>
	eventConditionBuilders.set(event, buildPredictionCondition),
);

// Raid events
RAID_EVENTS.forEach((event: string) => eventConditionBuilders.set(event, buildRaidCondition));

// Shared chat events
SHARED_CHAT_EVENTS.forEach((event: string) =>
	eventConditionBuilders.set(event, buildSharedChatCondition),
);

// Stream events
STREAM_EVENTS.forEach((event: string) => eventConditionBuilders.set(event, buildStreamCondition));

// User events
USER_EVENTS.forEach((event: string) => eventConditionBuilders.set(event, buildUserCondition));

// Other events
[...DROP_ENTITLEMENT_EVENTS, ...EXTENSION_EVENTS, ...CONDUIT_EVENTS].forEach((event: string) =>
	eventConditionBuilders.set(event, buildOtherCondition),
);
