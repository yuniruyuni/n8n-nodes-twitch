import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TwitchOAuth2Api implements ICredentialType {
	name = 'twitchOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Twitch OAuth2 API';

	icon: Icon = { light: 'file:../icons/twitch.svg', dark: 'file:../icons/twitch.dark.svg' };

	documentationUrl = 'https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/';

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Client-ID': '={{$credentials.clientId}}',
			},
		},
	};

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
			type: 'string',
			default: 'user:read:email',
			description: 'Space-separated Twitch scopes required for your application. See <a href="https://dev.twitch.tv/docs/authentication/scopes/" target="_blank">Twitch Scopes</a> for details.',
			placeholder: 'user:read:email channel:read:subscriptions moderator:read:chatters',
			hint: 'Enter scopes separated by spaces (e.g., "user:read:email channel:read:subscriptions")',
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
}
