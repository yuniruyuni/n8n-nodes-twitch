# ADR 001: Field Naming Conventions and Twitch API Terminology

## Status

Accepted (2025-01-26)

## Context

The Twitch API uses specific terminology to identify users and other resources:

- **id**: A unique numeric identifier (e.g., `"123456789"`)
- **login**: A user's login name, always lowercase (e.g., `"torpedo09"`)
- **display_name**: A user's display name with capitalization (e.g., `"TorpedO09"`)

Previously, our implementation:
1. Used inconsistent terminology ("username" instead of "login")
2. Had verbose field names like "Broadcaster ID or Username", "Game ID", "Video IDs"
3. Mixed ID and login acceptance in field names, causing confusion about what inputs are valid

This created several UX issues:
- Users unsure whether fields accept IDs only or both IDs and login names
- Verbose field names cluttered the UI
- Incorrect terminology ("username") didn't match Twitch API documentation
- Inconsistency between how we named singular vs. plural ID fields

## Decision

We adopted the following naming conventions:

### 1. Use Correct Twitch API Terminology

- Replace all references to "username" with "login name"
- Function renamed: `resolveUserIdOrUsername` → `resolveUserIdOrLogin`
- Documentation and descriptions updated to use "login name"

### 2. Simplify Field Display Names

**Remove "ID" suffix from singular fields:**
- `"Game ID"` → `"Game"`
- `"Video ID"` → `"Video"`
- `"Poll ID"` → `"Poll"`
- `"Prediction ID"` → `"Prediction"`
- etc.

**Remove "IDs" suffix from plural fields:**
- `"Video IDs"` → `"Videos"`
- `"Game IDs"` → `"Games"`
- `"User IDs"` → `"Users"`
- `"Poll IDs"` → `"Polls"`
- etc.

**Simplify user/broadcaster fields:**
- `"Broadcaster ID or Username"` → `"Broadcaster"`
- `"User ID or Username"` → `"User"`
- `"Moderator ID or Username"` → `"Moderator"`
- etc.

### 3. Clarify Accepted Inputs in Descriptions

**For fields accepting both ID and login:**
```
displayName: 'Broadcaster'
description: 'Broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.'
```

**For ID-only fields:**
```
displayName: 'Game'
description: 'Game ID. ID of the game the videos are of.'
```

Pattern: Prefix with "XXX ID." to immediately clarify it's ID-only.

### 4. Update Placeholders

- Replace generic examples: `"e.g. 123456789 or username"` → `"e.g. 123456789 or torpedo09"`
- Use real Twitch login name format in examples

## Consequences

### Positive

1. **Improved clarity**: Users immediately understand whether a field accepts IDs only or both IDs and login names by reading the description
2. **Cleaner UI**: Shorter field names reduce visual clutter
3. **Consistent with Twitch API**: Using "login" terminology matches official Twitch documentation
4. **Better examples**: Real-world login name examples (`torpedo09`) are more intuitive than generic placeholders
5. **Systematic approach**: Clear pattern for naming singular, plural, and ID-vs-login fields

### Negative

1. **Migration consideration**: Existing workflows using these node parameters are unaffected (parameter `name` properties unchanged), but users may need to adjust to new display names
2. **Documentation effort**: All field descriptions needed updating across 50+ resource files

### Neutral

1. Internal parameter names (e.g., `gameId`, `userId`) remain unchanged to maintain backward compatibility
2. The converter function is now named more accurately (`resolveUserIdOrLogin`) but maintains the same behavior

## Implementation Details

- **Files affected**: 50+ resource files in `nodes/Twitch/resources/`
- **Function renamed**: `shared/userIdConverter.ts` exports `resolveUserIdOrLogin`
- **TriggerNode updated**: 13 event files in `nodes/TwitchTrigger/events/`
- **Pattern applied consistently**: All fields follow the same naming convention

## References

- Twitch API Documentation: https://dev.twitch.tv/docs/api/reference
- Original discussion: Context from 2025-01-26 refactoring session
