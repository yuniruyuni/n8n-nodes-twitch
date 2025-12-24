# Twitch Node Consolidation Guide

This guide documents the consolidation of 24 separate Twitch nodes into a single unified Twitch node.

## Resource Mapping

Each old node maps to a resource in the new unified node:

1. **user** ← TwitchUsers
2. **channel** ← TwitchChannels
3. **stream** ← TwitchStreams
4. **clip** ← TwitchClips
5. **video** ← TwitchVideos
6. **poll** ← TwitchPolls
7. **prediction** ← TwitchPredictions
8. **raid** ← TwitchRaids
9. **subscription** ← TwitchSubscriptions
10. **customReward** ← TwitchCustomRewards
11. **redemption** ← TwitchRedemptions
12. **moderator** ← TwitchModerators
13. **ban** ← TwitchBans
14. **chatMessage** ← TwitchChatMessages
15. **chatter** ← TwitchChatters
16. **emote** ← TwitchEmotes
17. **cheermote** ← TwitchCheermotes
18. **schedule** ← TwitchSchedule
19. **team** ← TwitchTeams
20. **game** ← TwitchGames
21. **search** ← TwitchSearch
22. **announcement** ← TwitchAnnouncements
23. **bitsLeaderboard** ← TwitchBitsLeaderboard
24. **whisper** ← TwitchWhispers

## Resource File Pattern

Each resource file (`resources/ResourceName.ts`) exports two arrays:

```typescript
import type { INodeProperties } from 'n8n-workflow';

// For resources using userIdConverter
import { resolveUserIdOrUsername } from '../shared/userIdConverter';

export const resourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['resourceName'], // Add this constraint
			},
		},
		options: [
			// ... operations from old node
		],
		default: 'defaultOperation',
	},
];

export const resourceFields: INodeProperties[] = [
	// All field definitions from old node
	// Add resource: ['resourceName'] to displayOptions.show
];
```

## Key Changes

### 1. DisplayOptions

All properties must include `resource: ['resourceName']` in their `displayOptions.show`:

```typescript
displayOptions: {
	show: {
		resource: ['user'],  // <-- ADD THIS
		operation: ['get'],
	},
},
```

### 2. Import Path for userIdConverter

Update imports from:
```typescript
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
```

To:
```typescript
import { resolveUserIdOrUsername } from '../shared/userIdConverter';
```

### 3. Parameter Names

Keep all parameter names exactly as they were to maintain compatibility.

## Resources Requiring userIdConverter

These resources import and use `resolveUserIdOrUsername`:

- Channel
- Clip
- Video
- Poll
- Prediction
- Raid
- Subscription
- CustomReward
- Redemption
- Moderator
- Ban
- ChatMessage
- Chatter
- Emote
- Cheermote
- Schedule
- Team
- BitsLeaderboard

## Resources NOT Using userIdConverter

- User (uses plain login parameter)
- Stream (uses plain user_login parameter)
- Game
- Search
- Whisper (uses plain user IDs)

## Main Node Structure

The main `Twitch.node.ts` imports all resources and spreads them into the properties array:

```typescript
import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

// Import all resources
import { userOperations, userFields } from './resources/User';
import { channelOperations, channelFields } from './resources/Channel';
// ... import all 24 resources

export class Twitch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch',
		name: 'twitch',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Twitch API',
		defaults: {
			name: 'Twitch',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.twitch.tv/helix',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Announcement', value: 'announcement' },
					{ name: 'Ban', value: 'ban' },
					{ name: 'Bits Leaderboard', value: 'bitsLeaderboard' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'Chat Message', value: 'chatMessage' },
					{ name: 'Chatter', value: 'chatter' },
					{ name: 'Cheermote', value: 'cheermote' },
					{ name: 'Clip', value: 'clip' },
					{ name: 'Custom Reward', value: 'customReward' },
					{ name: 'Emote', value: 'emote' },
					{ name: 'Game', value: 'game' },
					{ name: 'Moderator', value: 'moderator' },
					{ name: 'Poll', value: 'poll' },
					{ name: 'Prediction', value: 'prediction' },
					{ name: 'Raid', value: 'raid' },
					{ name: 'Redemption', value: 'redemption' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Search', value: 'search' },
					{ name: 'Stream', value: 'stream' },
					{ name: 'Subscription', value: 'subscription' },
					{ name: 'Team', value: 'team' },
					{ name: 'User', value: 'user' },
					{ name: 'Video', value: 'video' },
					{ name: 'Whisper', value: 'whisper' },
				],
				default: 'user',
			},
			// Spread all operations
			...userOperations,
			...channelOperations,
			...streamOperations,
			// ... all 24 resources

			// Spread all fields
			...userFields,
			...channelFields,
			...streamFields,
			// ... all 24 resources
		],
	};
}
```

## Implementation Steps

1. ✅ Create directory structure
2. ✅ Move userIdConverter.ts to shared/
3. ✅ Copy icon files
4. Create all 24 resource files (User.ts, Channel.ts, etc.)
5. Create main Twitch.node.ts
6. Update package.json
7. Build and test

## Testing Checklist

After consolidation, verify:

- [ ] All 24 resources appear in Resource dropdown
- [ ] Operations change based on selected resource
- [ ] All parameters show/hide correctly
- [ ] Username-to-ID conversion works
- [ ] All API calls work identically to old nodes
- [ ] Node builds without errors
- [ ] Icons display correctly (light/dark mode)
