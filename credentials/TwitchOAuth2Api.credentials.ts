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
					name: 'analytics:read:extensions',
					value: 'analytics:read:extensions',
					description: 'View analytics data for the Twitch Extensions owned by the authenticated account',
				},
				{
					name: 'analytics:read:games',
					value: 'analytics:read:games',
					description: 'View analytics data for the games owned by the authenticated account',
				},
				// Bits
				{
					name: 'bits:read',
					value: 'bits:read',
					description: 'View Bits information for a channel',
				},
				// Channel
				{
					name: 'channel:bot',
					value: 'channel:bot',
					description: 'Perform bot actions in a channel',
				},
				{
					name: 'channel:manage:ads',
					value: 'channel:manage:ads',
					description: 'Manage ads schedule on a channel',
				},
				{
					name: 'channel:read:ads',
					value: 'channel:read:ads',
					description: 'Read the ads schedule and details on your channel',
				},
				{
					name: 'channel:manage:broadcast',
					value: 'channel:manage:broadcast',
					description: 'Manage a channel\'s broadcast configuration, including updating channel configuration and managing stream markers and stream tags',
				},
				{
					name: 'channel:read:charity',
					value: 'channel:read:charity',
					description: 'Read charity campaign details and user donations on your channel',
				},
				{
					name: 'channel:manage:clips',
					value: 'channel:manage:clips',
					description: 'Manage Clips for a channel',
				},
				{
					name: 'channel:edit:commercial',
					value: 'channel:edit:commercial',
					description: 'Run commercials on a channel',
				},
				{
					name: 'channel:read:editors',
					value: 'channel:read:editors',
					description: 'View a list of users with the editor role for a channel',
				},
				{
					name: 'channel:manage:extensions',
					value: 'channel:manage:extensions',
					description: 'Manage a channel\'s Extension configuration, including activating Extensions',
				},
				{
					name: 'channel:read:goals',
					value: 'channel:read:goals',
					description: 'View Creator Goals for a channel',
				},
				{
					name: 'channel:read:guest_star',
					value: 'channel:read:guest_star',
					description: 'Read Guest Star details for your channel',
				},
				{
					name: 'channel:manage:guest_star',
					value: 'channel:manage:guest_star',
					description: 'Manage Guest Star for your channel',
				},
				{
					name: 'channel:read:hype_train',
					value: 'channel:read:hype_train',
					description: 'View Hype Train information for a channel',
				},
				{
					name: 'channel:moderate',
					value: 'channel:moderate',
					description: 'Perform moderation actions in a channel',
				},
				{
					name: 'channel:manage:moderators',
					value: 'channel:manage:moderators',
					description: 'Add or remove the moderator role from users in your channel',
				},
				{
					name: 'channel:read:polls',
					value: 'channel:read:polls',
					description: 'View a channel\'s polls',
				},
				{
					name: 'channel:manage:polls',
					value: 'channel:manage:polls',
					description: 'Manage a channel\'s polls',
				},
				{
					name: 'channel:read:predictions',
					value: 'channel:read:predictions',
					description: 'View a channel\'s Channel Points Predictions',
				},
				{
					name: 'channel:manage:predictions',
					value: 'channel:manage:predictions',
					description: 'Manage a channel\'s Channel Points Predictions',
				},
				{
					name: 'channel:manage:raids',
					value: 'channel:manage:raids',
					description: 'Manage a channel raiding another channel',
				},
				{
					name: 'channel:read:redemptions',
					value: 'channel:read:redemptions',
					description: 'View Channel Points custom rewards and their redemptions on a channel',
				},
				{
					name: 'channel:manage:redemptions',
					value: 'channel:manage:redemptions',
					description: 'Manage Channel Points custom rewards and their redemptions on a channel',
				},
				{
					name: 'channel:manage:schedule',
					value: 'channel:manage:schedule',
					description: 'Manage a channel\'s stream schedule',
				},
				{
					name: 'channel:read:stream_key',
					value: 'channel:read:stream_key',
					description: 'View an authorized user\'s stream key',
				},
				{
					name: 'channel:read:subscriptions',
					value: 'channel:read:subscriptions',
					description: 'View a list of all subscribers to a channel and check if a user is subscribed to a channel',
				},
				{
					name: 'channel:manage:videos',
					value: 'channel:manage:videos',
					description: 'Manage a channel\'s videos, including deleting videos',
				},
				{
					name: 'channel:read:vips',
					value: 'channel:read:vips',
					description: 'View a list of users with the VIP role in a channel',
				},
				{
					name: 'channel:manage:vips',
					value: 'channel:manage:vips',
					description: 'Add or remove the VIP role from users in your channel',
				},
				// Moderator
				{
					name: 'moderator:manage:announcements',
					value: 'moderator:manage:announcements',
					description: 'Send announcements in channels where you have the moderator role',
				},
				{
					name: 'moderator:manage:automod',
					value: 'moderator:manage:automod',
					description: 'Manage messages held for review by AutoMod in channels where you are a moderator',
				},
				{
					name: 'moderator:read:automod_settings',
					value: 'moderator:read:automod_settings',
					description: 'View a broadcaster\'s AutoMod settings',
				},
				{
					name: 'moderator:manage:automod_settings',
					value: 'moderator:manage:automod_settings',
					description: 'Manage a broadcaster\'s AutoMod settings',
				},
				{
					name: 'moderator:read:banned_users',
					value: 'moderator:read:banned_users',
					description: 'View a broadcaster\'s list of banned users',
				},
				{
					name: 'moderator:manage:banned_users',
					value: 'moderator:manage:banned_users',
					description: 'Ban and unban users',
				},
				{
					name: 'moderator:read:blocked_terms',
					value: 'moderator:read:blocked_terms',
					description: 'View a broadcaster\'s list of blocked terms',
				},
				{
					name: 'moderator:manage:blocked_terms',
					value: 'moderator:manage:blocked_terms',
					description: 'Manage a broadcaster\'s list of blocked terms',
				},
				{
					name: 'moderator:read:chat_messages',
					value: 'moderator:read:chat_messages',
					description: 'View chat messages in channels where you have the moderator role',
				},
				{
					name: 'moderator:manage:chat_messages',
					value: 'moderator:manage:chat_messages',
					description: 'Delete chat messages in channels where you have the moderator role',
				},
				{
					name: 'moderator:read:chat_settings',
					value: 'moderator:read:chat_settings',
					description: 'View a broadcaster\'s chat room settings',
				},
				{
					name: 'moderator:manage:chat_settings',
					value: 'moderator:manage:chat_settings',
					description: 'Manage a broadcaster\'s chat room settings',
				},
				{
					name: 'moderator:read:chatters',
					value: 'moderator:read:chatters',
					description: 'View the chatters in a broadcaster\'s chat room',
				},
				{
					name: 'moderator:read:followers',
					value: 'moderator:read:followers',
					description: 'View a broadcaster\'s followers',
				},
				{
					name: 'moderator:read:shield_mode',
					value: 'moderator:read:shield_mode',
					description: 'View a broadcaster\'s Shield Mode status',
				},
				{
					name: 'moderator:manage:shield_mode',
					value: 'moderator:manage:shield_mode',
					description: 'Manage a broadcaster\'s Shield Mode status',
				},
				{
					name: 'moderator:read:shoutouts',
					value: 'moderator:read:shoutouts',
					description: 'View a broadcaster\'s shoutouts',
				},
				{
					name: 'moderator:manage:shoutouts',
					value: 'moderator:manage:shoutouts',
					description: 'Manage a broadcaster\'s shoutouts',
				},
				{
					name: 'moderator:read:unban_requests',
					value: 'moderator:read:unban_requests',
					description: 'View a broadcaster\'s unban requests',
				},
				{
					name: 'moderator:manage:unban_requests',
					value: 'moderator:manage:unban_requests',
					description: 'Manage a broadcaster\'s unban requests',
				},
				{
					name: 'moderator:read:warnings',
					value: 'moderator:read:warnings',
					description: 'View warnings in channels where you have the moderator role',
				},
				{
					name: 'moderator:manage:warnings',
					value: 'moderator:manage:warnings',
					description: 'Warn users in channels where you have the moderator role',
				},
				// Clips
				{
					name: 'clips:edit',
					value: 'clips:edit',
					description: 'Manage Clips for a channel',
				},
				{
					name: 'editor:manage:clips',
					value: 'editor:manage:clips',
					description: 'Manage Clips for a channel using editor role',
				},
				// Moderation
				{
					name: 'moderation:read',
					value: 'moderation:read',
					description: 'View channels that the user has moderator privileges in',
				},
				// User
				{
					name: 'user:bot',
					value: 'user:bot',
					description: 'Perform bot actions as a user',
				},
				{
					name: 'user:manage:blocked_users',
					value: 'user:manage:blocked_users',
					description: 'Manage the list of blocked users',
				},
				{
					name: 'user:read:blocked_users',
					value: 'user:read:blocked_users',
					description: 'View the list of blocked users',
				},
				{
					name: 'user:read:broadcast',
					value: 'user:read:broadcast',
					description: 'View a user\'s broadcasting configuration, including Extension configurations',
				},
				{
					name: 'user:read:chat',
					value: 'user:read:chat',
					description: 'View live chat messages sent in your channel using EventSub',
				},
				{
					name: 'user:manage:chat_color',
					value: 'user:manage:chat_color',
					description: 'Update the color used for the user\'s name in chat',
				},
				{
					name: 'user:read:email',
					value: 'user:read:email',
					description: 'View a user\'s email address',
				},
				{
					name: 'user:read:emotes',
					value: 'user:read:emotes',
					description: 'View emotes available to a user',
				},
				{
					name: 'user:read:follows',
					value: 'user:read:follows',
					description: 'View the list of channels a user follows',
				},
				{
					name: 'user:read:moderated_channels',
					value: 'user:read:moderated_channels',
					description: 'View channels that the user has moderator privileges in',
				},
				{
					name: 'user:read:subscriptions',
					value: 'user:read:subscriptions',
					description: 'View if an authorized user is subscribed to specific channels',
				},
				{
					name: 'user:read:whispers',
					value: 'user:read:whispers',
					description: 'View whispers sent to a user',
				},
				{
					name: 'user:manage:whispers',
					value: 'user:manage:whispers',
					description: 'Send whispers on behalf of a user',
				},
				{
					name: 'user:write:chat',
					value: 'user:write:chat',
					description: 'Send live chat messages using IRC or the Twitch API',
				},
				// Chat (IRC)
				{
					name: 'chat:read',
					value: 'chat:read',
					description: 'View chat messages sent in a chatroom using an IRC connection',
				},
				{
					name: 'chat:edit',
					value: 'chat:edit',
					description: 'Send chat messages to a chatroom using an IRC connection',
				},
				// Whispers (PubSub)
				{
					name: 'whispers:read',
					value: 'whispers:read',
					description: 'Receive whisper messages for your user using PubSub',
				},
				{
					name: 'whispers:edit',
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
