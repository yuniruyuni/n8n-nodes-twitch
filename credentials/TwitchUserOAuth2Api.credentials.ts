import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TwitchUserOAuth2Api implements ICredentialType {
	name = 'twitchUserOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Twitch User OAuth2 API';

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
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: [
				'analytics:read:extensions',
				'analytics:read:games',
				'bits:read',
				'channel:bot',
				'channel:manage:ads',
				'channel:manage:clips',
				'channel:read:ads',
				'channel:manage:broadcast',
				'channel:read:charity',
				'channel:edit:commercial',
				'channel:read:editors',
				'channel:manage:extensions',
				'channel:read:goals',
				'channel:read:guest_star',
				'channel:manage:guest_star',
				'channel:read:hype_train',
				'channel:manage:moderators',
				'channel:read:polls',
				'channel:manage:polls',
				'channel:read:predictions',
				'channel:manage:predictions',
				'channel:manage:raids',
				'channel:read:redemptions',
				'channel:manage:redemptions',
				'channel:manage:schedule',
				'channel:read:stream_key',
				'channel:read:subscriptions',
				'channel:manage:videos',
				'channel:read:vips',
				'channel:manage:vips',
				'chat:edit',
				'chat:read',
				'clips:edit',
				'editor:manage:clips',
				'moderator:manage:announcements',
				'moderator:manage:automod',
				'moderator:read:automod_settings',
				'moderator:manage:automod_settings',
				'moderator:read:banned_users',
				'moderator:manage:banned_users',
				'moderator:read:blocked_terms',
				'moderator:manage:blocked_terms',
				'moderator:manage:guest_star',
				'moderator:manage:chat_messages',
				'moderator:read:chat_settings',
				'moderator:manage:chat_settings',
				'moderator:read:chatters',
				'moderator:read:followers',
				'moderator:read:guest_star',
				'moderator:read:moderators',
				'moderator:read:shield_mode',
				'moderator:manage:shield_mode',
				'moderator:read:shoutouts',
				'moderator:manage:shoutouts',
				'moderator:read:suspicious_users',
				'moderator:read:unban_requests',
				'moderator:manage:unban_requests',
				'moderator:read:warnings',
				'moderator:manage:warnings',
				'user:bot',
				'user:edit',
				'user:edit:broadcast',
				'user:manage:blocked_users',
				'user:read:blocked_users',
				'user:read:broadcast',
				'user:manage:chat_color',
				'user:read:chat',
				'user:write:chat',
				'user:read:email',
				'user:read:emotes',
				'user:read:follows',
				'user:read:moderated_channels',
				'user:read:subscriptions',
				'user:read:whispers',
				'user:manage:whispers',
				'whispers:read',
			].join(' '),
			description: 'OAuth2 scopes for Twitch API access. To customize scopes, use the Generic OAuth2 API credential instead. See <a href="https://dev.twitch.tv/docs/authentication/scopes/" target="_blank">Twitch Scopes</a> for details.',
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.twitch.tv/helix',
			url: '/users',
			headers: {
				'Client-ID': '={{$credentials.clientId}}',
			},
		},
	};
}
