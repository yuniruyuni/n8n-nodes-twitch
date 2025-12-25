import {
	ApplicationError,
	NodeConnectionTypes,
	type IHookFunctions,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	type IDataObject,
} from 'n8n-workflow';
import { createHmac, timingSafeEqual } from 'crypto';
import { triggerProperties } from './events';
import { eventConditionBuilders } from './events/conditionBuilders';

export class TwitchTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitch Trigger',
		name: 'twitchTrigger',
		icon: { light: 'file:twitch.svg', dark: 'file:twitch.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Listen to Twitch EventSub notifications via Webhook',
		defaults: {
			name: 'Twitch Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchAppOAuth2Api',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: triggerProperties,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.subscriptionId === undefined) {
					return false;
				}

				const credentials = await this.getCredentials('twitchAppOAuth2Api');
				const clientId = credentials.clientId as string;

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'twitchAppOAuth2Api',
						{
							method: 'GET',
							url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${webhookData.subscriptionId}`,
							headers: {
								'Client-ID': clientId,
							},
							json: true,
						},
					);

					const data = response as IDataObject;
					const subscriptions = (data.data as IDataObject[]) || [];
					return subscriptions.length > 0;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const event = this.getNodeParameter('event') as string;

				const credentials = await this.getCredentials('twitchAppOAuth2Api');
				const clientId = credentials.clientId as string;

				// Generate a random secret for webhook verification
				const secret = Array.from({ length: 32 }, () =>
					Math.random().toString(36).charAt(2),
				).join('');

				// Build condition using event-specific builder function
				const buildCondition = eventConditionBuilders.get(event);
				if (!buildCondition) {
					throw new ApplicationError(`No condition builder found for event: ${event}`);
				}
				const condition = await buildCondition(this, event);

				const requestBody = {
					type: event,
					version: '1',
					condition,
					transport: {
						method: 'webhook',
						callback: webhookUrl,
						secret,
					},
				};

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'twitchAppOAuth2Api',
						{
							method: 'POST',
							url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
							headers: {
								'Client-ID': clientId,
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						},
					);

					const data = response as IDataObject;
					const subscription = (data.data as IDataObject[])[0];

					webhookData.subscriptionId = subscription.id;
					webhookData.secret = secret;

					return true;
				} catch (error) {
					const errorData = error as {
						description?: string;
						message?: string;
					};

					// Provide helpful error message for common issues
					let errorMessage = errorData.description || errorData.message || String(error);

					if (errorMessage.includes('https callback with standard port')) {
						errorMessage =
							'Twitch EventSub requires HTTPS webhook URL with port 443. ' +
							'Local development (http://localhost) is not supported. ' +
							'Deploy to a server with HTTPS or use a tunneling service like ngrok.';
					}

					throw new ApplicationError(`Failed to create Twitch EventSub subscription: ${errorMessage}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.subscriptionId === undefined) {
					return false;
				}

				const credentials = await this.getCredentials('twitchAppOAuth2Api');
				const clientId = credentials.clientId as string;

				try {
					await this.helpers.httpRequestWithAuthentication.call(
						this,
						'twitchAppOAuth2Api',
						{
							method: 'DELETE',
							url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${webhookData.subscriptionId}`,
							headers: {
								'Client-ID': clientId,
							},
						},
					);

					delete webhookData.subscriptionId;
					delete webhookData.secret;

					return true;
				} catch {
					return false;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');
		const bodyData = this.getBodyData();
		const headerData = this.getHeaderData();
		const req = this.getRequestObject();

		// Get raw body for signature verification
		const rawBody = (req as IDataObject).rawBody || JSON.stringify(bodyData);

		const messageId = headerData['twitch-eventsub-message-id'] as string;
		const messageTimestamp = headerData['twitch-eventsub-message-timestamp'] as string;
		const messageSignature = headerData['twitch-eventsub-message-signature'] as string;
		const messageType = headerData['twitch-eventsub-message-type'] as string;

		// Verify signature
		const secret = webhookData.secret as string;
		if (secret && messageSignature) {
			const hmacMessage = messageId + messageTimestamp + rawBody;
			const expectedSignature =
				'sha256=' +
				createHmac('sha256', secret).update(hmacMessage).digest('hex');

			const signatureBuffer = Buffer.from(expectedSignature);
			const receivedSignatureBuffer = Buffer.from(messageSignature);

			if (
				signatureBuffer.length !== receivedSignatureBuffer.length ||
				!timingSafeEqual(signatureBuffer, receivedSignatureBuffer)
			) {
				return {
					workflowData: [],
				};
			}
		}

		// Handle challenge verification
		if (messageType === 'webhook_callback_verification') {
			const challenge = (bodyData as IDataObject).challenge as string;
			return {
				webhookResponse: challenge,
				workflowData: [],
			};
		}

		// Handle notification
		if (messageType === 'notification') {
			const event = ((bodyData as IDataObject).event as IDataObject) || {};
			return {
				workflowData: [this.helpers.returnJsonArray([event])],
			};
		}

		// Handle revocation
		if (messageType === 'revocation') {
			return {
				workflowData: [],
			};
		}

		return {
			workflowData: [],
		};
	}
}
