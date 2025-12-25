import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TwitchAppOAuth2Api implements ICredentialType {
	name = 'twitchAppOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Twitch App OAuth2 API';

	icon: Icon = { light: 'file:../icons/twitch.svg', dark: 'file:../icons/twitch.dark.svg' };

	documentationUrl = 'https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'clientCredentials',
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
			default: 'bits:read channel:bot channel:manage:redemptions channel:moderate channel:read:ads channel:read:charity channel:read:goals channel:read:guest_star channel:read:hype_train channel:read:polls channel:read:predictions channel:read:redemptions channel:read:subscriptions channel:read:vips channel:manage:guest_star channel:manage:polls channel:manage:predictions channel:manage:redemptions channel:manage:vips moderator:manage:automod moderator:manage:banned_users moderator:manage:blocked_terms moderator:manage:chat_messages moderator:manage:chat_settings moderator:manage:shield_mode moderator:manage:shoutouts moderator:manage:unban_requests moderator:manage:warnings moderator:read:automod_settings moderator:read:banned_users moderator:read:blocked_terms moderator:read:chat_messages moderator:read:chat_settings moderator:read:followers moderator:read:guest_star moderator:read:moderators moderator:read:shield_mode moderator:read:shoutouts moderator:read:suspicious_users moderator:read:unban_requests moderator:read:vips moderator:read:warnings moderation:read user:bot user:manage:whispers user:read:chat user:read:email user:read:whispers',
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
			url: '/streams',
			headers: {
				'Client-ID': '={{$credentials.clientId}}',
			},
		},
	};
}
