import type { IExecuteFunctions, IExecuteSingleFunctions, IHookFunctions, ITriggerFunctions, IHttpRequestOptions } from 'n8n-workflow';

/**
 * Convert Twitch username to user ID
 * If input is already a numeric ID, returns it as-is
 * If input is a username, calls Twitch API to resolve to ID
 */
export async function resolveUserIdOrUsername(
	this: IExecuteFunctions | IExecuteSingleFunctions | IHookFunctions | ITriggerFunctions,
	input: string,
): Promise<string> {
	// If input is empty, return as-is
	if (!input) {
		return input;
	}

	// If input is all numeric, assume it's already a user ID
	if (/^\d+$/.test(input)) {
		return input;
	}

	// Otherwise, treat it as a username and resolve to ID
	const credentials = await this.getCredentials('twitchUserOAuth2Api');
	const clientId = credentials.clientId as string;

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `https://api.twitch.tv/helix/users`,
		qs: {
			login: input,
		},
		headers: {
			'Client-ID': clientId,
		},
		json: true,
	};

	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'twitchUserOAuth2Api',
		options,
	)) as {
		data: Array<{ id: string; login: string }>;
	};

	if (!response.data || response.data.length === 0) {
		throw new Error(`Twitch user "${input}" not found`);
	}

	return response.data[0].id;
}
