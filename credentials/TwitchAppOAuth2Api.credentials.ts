import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class TwitchAppOAuth2Api implements ICredentialType {
	name = 'twitchAppOAuth2Api';

	displayName = 'Twitch App API';

	icon: Icon = { light: 'file:../icons/twitch.svg', dark: 'file:../icons/twitch.dark.svg' };

	documentationUrl = 'https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
				password: true,
			},
			default: '',
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
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		// Get OAuth2 token using Client Credentials flow
		const response = (await this.helpers.httpRequest({
			method: 'POST',
			url: 'https://id.twitch.tv/oauth2/token',
			body: {
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret,
				grant_type: 'client_credentials',
			},
			json: true,
		})) as { access_token: string; expires_in: number; token_type: string };

		return {
			accessToken: response.access_token,
		};
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
				'Client-ID': '={{$credentials.clientId}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.twitch.tv/helix',
			url: '/users',
		},
	};
}
