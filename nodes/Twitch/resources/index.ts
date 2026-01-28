import type { INodeProperties } from 'n8n-workflow';

import { adOperations, adFields } from './Ad';
import { analyticsOperations, analyticsFields } from './Analytics';
import { announcementOperations, announcementFields } from './Announcement';
import { badgeOperations, badgeFields } from './Badge';
import { banOperations, banFields } from './Ban';
import { bitsLeaderboardOperations, bitsLeaderboardFields } from './BitsLeaderboard';
import { channelOperations, channelFields } from './Channel';
import { charityOperations, charityFields } from './Charity';
import { chatMessageOperations, chatMessageFields } from './ChatMessage';
import { chatSettingsOperations, chatSettingsFields } from './ChatSettings';
import { chatterOperations, chatterFields } from './Chatter';
import { cheermoteOperations, cheermoteFields } from './Cheermote';
import { clipOperations, clipFields } from './Clip';
import { customRewardOperations, customRewardFields } from './CustomReward';
import { emoteOperations, emoteFields } from './Emote';
import { gameOperations, gameFields } from './Game';
import { goalOperations, goalFields } from './Goal';
import { hypeTrainOperations, hypeTrainFields } from './HypeTrain';
import { moderationOperations, moderationFields } from './Moderation';
import { moderatorOperations, moderatorFields } from './Moderator';
import { pollOperations, pollFields } from './Poll';
import { predictionOperations, predictionFields } from './Prediction';
import { raidOperations, raidFields } from './Raid';
import { redemptionOperations, redemptionFields } from './Redemption';
import { scheduleOperations, scheduleFields } from './Schedule';
import { searchOperations, searchFields } from './Search';
import { shoutoutOperations, shoutoutFields } from './Shoutout';
import { streamOperations, streamFields } from './Stream';
import { subscriptionOperations, subscriptionFields } from './Subscription';
import { teamOperations, teamFields } from './Team';
import { userOperations, userFields } from './User';
import { videoOperations, videoFields } from './Video';
import { vipOperations, vipFields } from './VIP';
import { whisperOperations, whisperFields } from './Whisper';

export const allOperations: INodeProperties[] = [
	...adOperations,
	...analyticsOperations,
	...announcementOperations,
	...badgeOperations,
	...banOperations,
	...bitsLeaderboardOperations,
	...channelOperations,
	...charityOperations,
	...chatMessageOperations,
	...chatSettingsOperations,
	...chatterOperations,
	...cheermoteOperations,
	...clipOperations,
	...customRewardOperations,
	...emoteOperations,
	...gameOperations,
	...goalOperations,
	...hypeTrainOperations,
	...moderationOperations,
	...moderatorOperations,
	...pollOperations,
	...predictionOperations,
	...raidOperations,
	...redemptionOperations,
	...scheduleOperations,
	...searchOperations,
	...shoutoutOperations,
	...streamOperations,
	...subscriptionOperations,
	...teamOperations,
	...userOperations,
	...videoOperations,
	...vipOperations,
	...whisperOperations,
];

export const allFields: INodeProperties[] = [
	...adFields,
	...analyticsFields,
	...announcementFields,
	...badgeFields,
	...banFields,
	...bitsLeaderboardFields,
	...channelFields,
	...charityFields,
	...chatMessageFields,
	...chatSettingsFields,
	...chatterFields,
	...cheermoteFields,
	...clipFields,
	...customRewardFields,
	...emoteFields,
	...gameFields,
	...goalFields,
	...hypeTrainFields,
	...moderationFields,
	...moderatorFields,
	...pollFields,
	...predictionFields,
	...raidFields,
	...redemptionFields,
	...scheduleFields,
	...searchFields,
	...shoutoutFields,
	...streamFields,
	...subscriptionFields,
	...teamFields,
	...userFields,
	...videoFields,
	...vipFields,
	...whisperFields,
];
