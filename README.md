# n8n-nodes-twitch

[![CI](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml/badge.svg)](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@yuniruyuni%2Fn8n-nodes-twitch.svg)](https://www.npmjs.com/package/@yuniruyuni/n8n-nodes-twitch)

This is an n8n community node package for Twitch API integration. It provides comprehensive support for Twitch Helix API operations and real-time EventSub notifications via WebSocket.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

English | [日本語](README.ja.md)

## Features

### 25 Twitch API Nodes

All nodes follow Twitch Helix API's resource-oriented structure:

**User & Channel Management:**
- **Twitch Users** - Get user information
- **Twitch Channels** - Get channel information
- **Twitch Streams** - Get stream information

**Content & Media:**
- **Twitch Clips** - Get, create clips
- **Twitch Videos** - Get videos
- **Twitch Games** - Get games, top games
- **Twitch Search** - Search categories, channels, streams

**Chat & Communication:**
- **Twitch Chat Messages** - Send messages
- **Twitch Chatters** - Get chatters list
- **Twitch Emotes** - Get channel emotes
- **Twitch Announcements** - Send announcements
- **Twitch Whispers** - Send whispers

**Channel Points & Rewards:**
- **Twitch Custom Rewards** - Create, get, update, delete custom rewards
- **Twitch Redemptions** - Get, update redemption status

**Moderation:**
- **Twitch Bans** - Ban, unban users, get banned users
- **Twitch Moderators** - Get, add, remove moderators

**Engagement:**
- **Twitch Polls** - Get, create, end polls
- **Twitch Predictions** - Get, create, lock, resolve predictions
- **Twitch Raids** - Start, cancel raids

**Monetization:**
- **Twitch Bits Leaderboard** - Get bits leaderboard
- **Twitch Cheermotes** - Get cheermotes
- **Twitch Subscriptions** - Get broadcaster subscriptions, check user subscription

**Scheduling & Teams:**
- **Twitch Schedule** - Get, create, update, delete stream segments
- **Twitch Teams** - Get channel teams, team information

### EventSub Trigger Node

**Twitch Trigger** - Real-time event notifications via Webhook:

- **Stream Events:** online, offline
- **Channel Events:** update, follow, subscribe, subscription end/gift/message, cheer, raid, ban, unban
- **Chat Events:** message, clear, notification, message delete, clear user messages
- **Channel Points:** custom reward add/update/remove, redemption add/update
- **Polls:** begin, progress, end
- **Predictions:** begin, progress, lock, end
- **Goals:** begin, progress, end
- **Hype Train:** begin, progress, end
- **Moderator:** add, remove
- **Shield Mode:** begin, end
- **Shoutout:** create, receive

**Supports 45+ EventSub events** with automatic subscription management and signature verification.

## Authentication

Two authentication methods are supported:

1. **Client Credentials** (TwitchApi) - App access tokens using Client ID and Secret
2. **OAuth2** (TwitchOAuth2Api) - User access tokens with customizable scopes

OAuth2 credentials include scope selection for:
- User information (`user:read:email`)
- Channel management (`channel:manage:*`)
- Moderation (`moderator:manage:*`)
- Chat operations (`chat:read`, `chat:edit`)
- And many more...

## Installation

### Self-Hosted n8n

Install via npm in your n8n installation directory:

```bash
npm install @yuniruyuni/n8n-nodes-twitch
```

Or add to your n8n environment:

```bash
N8N_CUSTOM_EXTENSIONS="/path/to/@yuniruyuni/n8n-nodes-twitch"
```

For Docker installations, mount the package or add to your custom nodes directory.

### n8n Cloud

**Fully compatible** - This package uses the declarative routing pattern with no external dependencies. The Twitch Trigger node uses webhooks for EventSub notifications, which work seamlessly on n8n Cloud.

## Compatibility

- **n8n version:** 1.0.0 or higher
- **Node.js version:** 18.10.0 or higher (recommended: 20.x)

## Usage

### Setting up Twitch Credentials

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application or use an existing one
3. Note your Client ID and Client Secret
4. For OAuth2, set the OAuth Redirect URL to your n8n instance (e.g., `https://your-n8n.com/rest/oauth2-credential/callback`)

### Using Twitch Nodes

1. Add a Twitch node to your workflow
2. Create new credentials (Client Credentials or OAuth2)
3. Select the operation you want to perform
4. Configure the required parameters
5. Execute the workflow

### Using Twitch Trigger

1. Add the Twitch Trigger node to your workflow
2. Create credentials (Client Credentials or OAuth2 with appropriate scopes)
3. Select the EventSub event type you want to listen for
4. Configure broadcaster ID and other required parameters
5. Activate the workflow to start receiving events

The trigger uses webhooks to receive real-time events from Twitch. n8n automatically provides a secure HTTPS webhook URL (no manual webhook setup required on your end). When you activate the workflow, the node automatically:
- Creates an EventSub subscription on Twitch
- Verifies the webhook with Twitch's challenge mechanism
- Validates event signatures for security
- Automatically cleans up the subscription when the workflow is deactivated

## Development

### Prerequisites

- Node.js 18.10.0 or higher
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/yuniruyuni/n8n-nodes-twitch.git
cd n8n-nodes-twitch

# Install dependencies
npm install

# Build the nodes
npm run build

# Start n8n with the nodes loaded (development mode)
npm run dev
```

### Available Scripts

| Script                | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `npm run dev`         | Start n8n with your node and watch for changes |
| `npm run build`       | Compile TypeScript to JavaScript |
| `npm run build:watch` | Build in watch mode (auto-rebuild on changes) |
| `npm run lint`        | Check code for errors and style issues |
| `npm run lint:fix`    | Automatically fix linting issues |
| `npm run release`     | Create a new release |

### Release Process

This project uses `n8n-node release` (powered by `release-it`) for automated releases:

**Recommended: GitHub Actions**

1. Go to **Actions** → **Release** → **Run workflow**
2. Click **Run workflow**
3. GitHub Actions automatically:
   - Runs lint and build
   - Updates version in package.json (default increment)
   - Generates CHANGELOG
   - Creates git commit and tag
   - Publishes to npm
   - Creates GitHub release with notes

**Alternative: Local Release**

For local development workflow:
```bash
npm run release
```
This provides an interactive release process managed by `n8n-node release`.

**Prerequisites**:
- Set `NPM_TOKEN` secret in GitHub repository settings
- Ensure you have npm publishing rights for `@yuniruyuni/n8n-nodes-twitch`
- For local releases: `npm login` and clean git state on `master` branch required

## Architecture

This package uses the **declarative/low-code style** for all nodes:

- Direct calls to Twitch Helix API (`https://api.twitch.tv/helix`)
- n8n's `routing` property for HTTP requests
- **No external dependencies** - fully compatible with n8n Cloud
- Resource-oriented structure aligned with Twitch Helix API

The Twitch Trigger node uses n8n's webhook system to receive EventSub notifications via HTTPS, with built-in signature verification for security.

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Twitch API Documentation](https://dev.twitch.tv/docs/api/)
- [Twitch EventSub Documentation](https://dev.twitch.tv/docs/eventsub/)
- [Twitch Developer Console](https://dev.twitch.tv/console)

## License

[MIT](LICENSE.md)

## Version History

### 0.1.0

- Initial release
- 25 Twitch API nodes covering Users, Channels, Streams, Chat, Moderation, Channel Points, and more
- Twitch Trigger node with EventSub Webhook support (45+ events)
- Client Credentials and OAuth2 authentication
- Resource-oriented architecture aligned with Twitch Helix API structure
- **n8n Cloud compatible** - No external dependencies
