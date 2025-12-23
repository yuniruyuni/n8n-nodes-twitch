import type {
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class TwitchOAuth2Api implements ICredentialType {
	name = 'twitchOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Twitch OAuth2 API';

	icon: Icon = { light: 'file:../icons/twitch.svg', dark: 'file:../icons/twitch.dark.svg' };

	documentationUrl = 'https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://id.twitch.tv/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://id.twitch.tv/oauth2/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'multiOptions',
			default: ['user:read:email'],
			description: 'Select the Twitch scopes required for your application. See <a href="https://dev.twitch.tv/docs/authentication/scopes/" target="_blank">Twitch Scopes</a> for details.',
			options: [
				// Analytics
				{
					name: 'View Analytics',
					value: 'analytics:read:extensions',
					description: 'View analytics data for the Twitch Extensions owned by the authenticated account',
				},
				{
					name: 'View Game Analytics',
					value: 'analytics:read:games',
					description: 'View analytics data for the games owned by the authenticated account',
				},
				// Bits
				{
					name: 'Read Bits',
					value: 'bits:read',
					description: 'View Bits information for a channel',
				},
				// Channel
				{
					name: 'Channel Bot',
					value: 'channel:bot',
					description: 'Perform bot actions in a channel',
				},
				{
					name: 'Manage Ads',
					value: 'channel:manage:ads',
					description: 'Manage ads schedule on a channel',
				},
				{
					name: 'Read Ads',
					value: 'channel:read:ads',
					description: 'Read the ads schedule and details on your channel',
				},
				{
					name: 'Manage Broadcast',
					value: 'channel:manage:broadcast',
					description: 'Manage a channel\'s broadcast configuration, including updating channel configuration and managing stream markers and stream tags',
				},
				{
					name: 'Read Charity Campaign',
					value: 'channel:read:charity',
					description: 'Read charity campaign details and user donations on your channel',
				},
				{
					name: 'Manage Clips',
					value: 'channel:manage:clips',
					description: 'Manage Clips for a channel',
				},
				{
					name: 'Edit Commercial',
					value: 'channel:edit:commercial',
					description: 'Run commercials on a channel',
				},
				{
					name: 'Read Editors',
					value: 'channel:read:editors',
					description: 'View a list of users with the editor role for a channel',
				},
				{
					name: 'Manage Extensions',
					value: 'channel:manage:extensions',
					description: 'Manage a channel\'s Extension configuration, including activating Extensions',
				},
				{
					name: 'Read Goals',
					value: 'channel:read:goals',
					description: 'View Creator Goals for a channel',
				},
				{
					name: 'Read Guest Star',
					value: 'channel:read:guest_star',
					description: 'Read Guest Star details for your channel',
				},
				{
					name: 'Manage Guest Star',
					value: 'channel:manage:guest_star',
					description: 'Manage Guest Star for your channel',
				},
				{
					name: 'Read Hype Train',
					value: 'channel:read:hype_train',
					description: 'View Hype Train information for a channel',
				},
				{
					name: 'Moderate Channel',
					value: 'channel:moderate',
					description: 'Perform moderation actions in a channel',
				},
				{
					name: 'Manage Moderators',
					value: 'channel:manage:moderators',
					description: 'Add or remove the moderator role from users in your channel',
				},
				{
					name: 'Read Polls',
					value: 'channel:read:polls',
					description: 'View a channel\'s polls',
				},
				{
					name: 'Manage Polls',
					value: 'channel:manage:polls',
					description: 'Manage a channel\'s polls',
				},
				{
					name: 'Read Predictions',
					value: 'channel:read:predictions',
					description: 'View a channel\'s Channel Points Predictions',
				},
				{
					name: 'Manage Predictions',
					value: 'channel:manage:predictions',
					description: 'Manage a channel\'s Channel Points Predictions',
				},
				{
					name: 'Manage Raids',
					value: 'channel:manage:raids',
					description: 'Manage a channel raiding another channel',
				},
				{
					name: 'Read Redemptions',
					value: 'channel:read:redemptions',
					description: 'View Channel Points custom rewards and their redemptions on a channel',
				},
				{
					name: 'Manage Redemptions',
					value: 'channel:manage:redemptions',
					description: 'Manage Channel Points custom rewards and their redemptions on a channel',
				},
				{
					name: 'Manage Schedule',
					value: 'channel:manage:schedule',
					description: 'Manage a channel\'s stream schedule',
				},
				{
					name: 'Read Stream Key',
					value: 'channel:read:stream_key',
					description: 'View an authorized user\'s stream key',
				},
				{
					name: 'Read Subscriptions',
					value: 'channel:read:subscriptions',
					description: 'View a list of all subscribers to a channel and check if a user is subscribed to a channel',
				},
				{
					name: 'Manage Videos',
					value: 'channel:manage:videos',
					description: 'Manage a channel\'s videos, including deleting videos',
				},
				{
					name: 'Read VIPs',
					value: 'channel:read:vips',
					description: 'View a list of users with the VIP role in a channel',
				},
				{
					name: 'Manage VIPs',
					value: 'channel:manage:vips',
					description: 'Add or remove the VIP role from users in your channel',
				},
				// Moderator
				{
					name: 'Manage Announcements',
					value: 'moderator:manage:announcements',
					description: 'Send announcements in channels where you have the moderator role',
				},
				{
					name: 'Manage AutoMod',
					value: 'moderator:manage:automod',
					description: 'Manage messages held for review by AutoMod in channels where you are a moderator',
				},
				{
					name: 'Read AutoMod Settings',
					value: 'moderator:read:automod_settings',
					description: 'View a broadcaster\'s AutoMod settings',
				},
				{
					name: 'Manage AutoMod Settings',
					value: 'moderator:manage:automod_settings',
					description: 'Manage a broadcaster\'s AutoMod settings',
				},
				{
					name: 'Read Banned Users',
					value: 'moderator:read:banned_users',
					description: 'View a broadcaster\'s list of banned users',
				},
				{
					name: 'Manage Banned Users',
					value: 'moderator:manage:banned_users',
					description: 'Ban and unban users',
				},
				{
					name: 'Read Blocked Terms',
					value: 'moderator:read:blocked_terms',
					description: 'View a broadcaster\'s list of blocked terms',
				},
				{
					name: 'Manage Blocked Terms',
					value: 'moderator:manage:blocked_terms',
					description: 'Manage a broadcaster\'s list of blocked terms',
				},
				{
					name: 'Read Chat Messages',
					value: 'moderator:read:chat_messages',
					description: 'View chat messages in channels where you have the moderator role',
				},
				{
					name: 'Manage Chat Messages',
					value: 'moderator:manage:chat_messages',
					description: 'Delete chat messages in channels where you have the moderator role',
				},
				{
					name: 'Read Chat Settings',
					value: 'moderator:read:chat_settings',
					description: 'View a broadcaster\'s chat room settings',
				},
				{
					name: 'Manage Chat Settings',
					value: 'moderator:manage:chat_settings',
					description: 'Manage a broadcaster\'s chat room settings',
				},
				{
					name: 'Read Chatters',
					value: 'moderator:read:chatters',
					description: 'View the chatters in a broadcaster\'s chat room',
				},
				{
					name: 'Read Followers',
					value: 'moderator:read:followers',
					description: 'View a broadcaster\'s followers',
				},
				{
					name: 'Read Shield Mode',
					value: 'moderator:read:shield_mode',
					description: 'View a broadcaster\'s Shield Mode status',
				},
				{
					name: 'Manage Shield Mode',
					value: 'moderator:manage:shield_mode',
					description: 'Manage a broadcaster\'s Shield Mode status',
				},
				{
					name: 'Read Shoutouts',
					value: 'moderator:read:shoutouts',
					description: 'View a broadcaster\'s shoutouts',
				},
				{
					name: 'Manage Shoutouts',
					value: 'moderator:manage:shoutouts',
					description: 'Manage a broadcaster\'s shoutouts',
				},
				{
					name: 'Read Unban Requests',
					value: 'moderator:read:unban_requests',
					description: 'View a broadcaster\'s unban requests',
				},
				{
					name: 'Manage Unban Requests',
					value: 'moderator:manage:unban_requests',
					description: 'Manage a broadcaster\'s unban requests',
				},
				{
					name: 'Read Warnings',
					value: 'moderator:read:warnings',
					description: 'View warnings in channels where you have the moderator role',
				},
				{
					name: 'Manage Warnings',
					value: 'moderator:manage:warnings',
					description: 'Warn users in channels where you have the moderator role',
				},
				// Clips
				{
					name: 'Edit Clips',
					value: 'clips:edit',
					description: 'Manage Clips for a channel',
				},
				{
					name: 'Manage Clips (Editor)',
					value: 'editor:manage:clips',
					description: 'Manage Clips for a channel using editor role',
				},
				// Moderation
				{
					name: 'Read Moderated Channels',
					value: 'moderation:read',
					description: 'View channels that the user has moderator privileges in',
				},
				// User
				{
					name: 'User Bot',
					value: 'user:bot',
					description: 'Perform bot actions as a user',
				},
				{
					name: 'Manage Blocked Users',
					value: 'user:manage:blocked_users',
					description: 'Manage the list of blocked users',
				},
				{
					name: 'Read Blocked Users',
					value: 'user:read:blocked_users',
					description: 'View the list of blocked users',
				},
				{
					name: 'Read Broadcast',
					value: 'user:read:broadcast',
					description: 'View a user\'s broadcasting configuration, including Extension configurations',
				},
				{
					name: 'Read Chat',
					value: 'user:read:chat',
					description: 'View live chat messages sent in your channel using EventSub',
				},
				{
					name: 'Manage Chat Color',
					value: 'user:manage:chat_color',
					description: 'Update the color used for the user\'s name in chat',
				},
				{
					name: 'Read Email',
					value: 'user:read:email',
					description: 'View a user\'s email address',
				},
				{
					name: 'Read Emotes',
					value: 'user:read:emotes',
					description: 'View emotes available to a user',
				},
				{
					name: 'Read Follows',
					value: 'user:read:follows',
					description: 'View the list of channels a user follows',
				},
				{
					name: 'Read Moderated Channels',
					value: 'user:read:moderated_channels',
					description: 'View channels that the user has moderator privileges in',
				},
				{
					name: 'Read Subscriptions',
					value: 'user:read:subscriptions',
					description: 'View if an authorized user is subscribed to specific channels',
				},
				{
					name: 'Read Whispers',
					value: 'user:read:whispers',
					description: 'View whispers sent to a user',
				},
				{
					name: 'Manage Whispers',
					value: 'user:manage:whispers',
					description: 'Send whispers on behalf of a user',
				},
				{
					name: 'Write Chat',
					value: 'user:write:chat',
					description: 'Send live chat messages using IRC or the Twitch API',
				},
				// Chat (IRC)
				{
					name: 'Read Chat (IRC)',
					value: 'chat:read',
					description: 'View chat messages sent in a chatroom using an IRC connection',
				},
				{
					name: 'Edit Chat (IRC)',
					value: 'chat:edit',
					description: 'Send chat messages to a chatroom using an IRC connection',
				},
				// Whispers (PubSub)
				{
					name: 'Read Whispers (PubSub)',
					value: 'whispers:read',
					description: 'Receive whisper messages for your user using PubSub',
				},
				{
					name: 'Edit Whispers (PubSub)',
					value: 'whispers:edit',
					description: 'Send whisper messages using PubSub',
				},
			],
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'force_verify=false',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];

	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<IDataObject> {
		// Convert scope array to space-delimited string for OAuth2
		const result = { ...credentials };
		if (Array.isArray(result.scope)) {
			result.scope = result.scope.join(' ');
		}
		return result;
	}
}
