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
