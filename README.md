# n8n-nodes-twitch

[![CI](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml/badge.svg)](https://github.com/yuniruyuni/n8n-nodes-twitch/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@yuniruyuni%2Fn8n-nodes-twitch.svg)](https://www.npmjs.com/package/@yuniruyuni/n8n-nodes-twitch)

This is an n8n community node package for Twitch API integration. It provides comprehensive support for Twitch Helix API operations and real-time EventSub notifications via WebSocket.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

English | [日本語](README.ja.md)

## Features

### 34 Twitch API Resources

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

**Twitch Trigger** - Real-time event notifications via WebSocket:

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

**Supports 76 EventSub events** with automatic subscription management.

## Authentication

**Twitch User Access Token** - User access tokens for all operations
- Uses Authorization Code Grant Flow
- Required for both API operations and EventSub WebSocket subscriptions
- Pre-configured with comprehensive scopes (80 scopes) covering:
  - All 76 EventSub events
  - All Twitch Helix API operations
  - Chat, moderation, channel management, and more
- Requires: Client ID, Client Secret, and OAuth redirect URL

## Installation

### Install from n8n (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Click **Install**
3. Enter `@yuniruyuni/n8n-nodes-twitch` in the package name field
4. Click **Install**

This works for both n8n Cloud and self-hosted instances.

### Install manually (For development)

If you're developing or debugging this package:

**Via npm:**
```bash
npm install @yuniruyuni/n8n-nodes-twitch
```

**Via custom extensions path:**
```bash
N8N_CUSTOM_EXTENSIONS="/path/to/@yuniruyuni/n8n-nodes-twitch"
```

**For Docker:**
Mount the package directory or add it to your custom nodes directory.

## Compatibility

- **n8n version:** 1.0.0 or higher
- **Node.js version:** 21.0.0 or higher (required for global WebSocket support)

## Usage

### Setting up Twitch Credentials

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application or use an existing one
3. Note your Client ID and Client Secret
4. Set the OAuth Redirect URL to your n8n instance (e.g., `https://your-n8n.com/rest/oauth2-credential/callback`)

### Using Twitch Nodes

1. Add a Twitch node to your workflow
2. Create new **Twitch User Access Token** credentials
3. Select the resource and operation you want to perform
4. Configure the required parameters
5. Execute the workflow

### Using Twitch Trigger

1. Add the Twitch Trigger node to your workflow
2. Create **Twitch User Access Token** credentials
3. Select the EventSub event type you want to listen for
4. Configure broadcaster ID and other required parameters
5. Activate the workflow to start receiving events

The trigger uses WebSocket to receive real-time events from Twitch. When you activate the workflow, the node automatically:
- Connects to Twitch EventSub WebSocket (`wss://eventsub.wss.twitch.tv/ws`)
- Receives a session ID and creates an EventSub subscription
- Receives real-time event notifications via WebSocket
- Handles reconnections automatically
- Automatically cleans up the subscription when the workflow is deactivated

## Development

### Prerequisites

- Node.js 21.0.0 or higher (required for global WebSocket support)
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

This package uses the **declarative/low-code style** for Twitch API operations:

- Direct calls to Twitch Helix API (`https://api.twitch.tv/helix`)
- n8n's `routing` property for HTTP requests
- Resource-oriented structure aligned with Twitch Helix API

The Twitch Trigger node uses Node.js global WebSocket (available in Node.js 21+) to receive EventSub notifications via WebSocket (`wss://eventsub.wss.twitch.tv/ws`). No external dependencies required.

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Twitch API Documentation](https://dev.twitch.tv/docs/api/)
- [Twitch EventSub Documentation](https://dev.twitch.tv/docs/eventsub/)
- [Twitch Developer Console](https://dev.twitch.tv/console)

## License

[MIT](LICENSE.md)