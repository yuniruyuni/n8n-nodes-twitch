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
import { resolveUserIdOrUsername } from '../Twitch/shared/userIdConverter';
import {
	triggerProperties,
	BROADCASTER_ONLY_EVENTS,
	MODERATOR_EVENTS,
	CHAT_USER_EVENTS,
	REWARD_EVENTS,
} from './events';

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

				const condition: IDataObject = {};

				// Build condition based on event type pattern
				if (event === 'channel.raid') {
					const raidDirection = this.getNodeParameter('raidDirection') as string;
					const raidBroadcasterIdInput = this.getNodeParameter('raidBroadcasterId') as string;
					const raidBroadcasterId = await resolveUserIdOrUsername.call(this, raidBroadcasterIdInput);

					if (raidDirection === 'to') {
						condition.to_broadcaster_user_id = raidBroadcasterId;
					} else {
						condition.from_broadcaster_user_id = raidBroadcasterId;
					}
				}
				// Pattern 6: user_id only (2 events)
				else if (event === 'user.update' || event === 'user.whisper.message') {
					const userIdInput = this.getNodeParameter('userId') as string;
					condition.user_id = await resolveUserIdOrUsername.call(this, userIdInput);
				}
				// Pattern 7: special events
				else if (event === 'drop.entitlement.grant') {
					const organizationId = this.getNodeParameter('organizationId') as string;
					condition.organization_id = organizationId;

					const categoryId = this.getNodeParameter('categoryId', '') as string;
					if (categoryId && categoryId.trim() !== '') {
						condition.category_id = categoryId;
					}

					const campaignId = this.getNodeParameter('campaignId', '') as string;
					if (campaignId && campaignId.trim() !== '') {
						condition.campaign_id = campaignId;
					}
				}
				else if (event === 'extension.bits_transaction.create') {
					const extensionClientId = this.getNodeParameter('extensionClientId') as string;
					condition.extension_client_id = extensionClientId;
				}
				else if (event === 'conduit.shard.disabled') {
					const clientId = this.getNodeParameter('clientId') as string;
					condition.client_id = clientId;
				}
				// Pattern 2: moderator events
				else if (MODERATOR_EVENTS.includes(event)) {
					const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
					const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
					condition.broadcaster_user_id = broadcasterId;

					// Use moderatorId if provided, otherwise use broadcasterId
					const moderatorIdInput = this.getNodeParameter('moderatorId', '') as string;
					if (moderatorIdInput && moderatorIdInput.trim() !== '') {
						condition.moderator_user_id = await resolveUserIdOrUsername.call(this, moderatorIdInput);
					} else {
						condition.moderator_user_id = broadcasterId;
					}
				}
				// Pattern 3: chat user events
				else if (CHAT_USER_EVENTS.includes(event)) {
					const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
					const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
					condition.broadcaster_user_id = broadcasterId;

					const userIdInput = this.getNodeParameter('userId') as string;
					condition.user_id = await resolveUserIdOrUsername.call(this, userIdInput);
				}
				// Pattern 4: reward events
				else if (REWARD_EVENTS.includes(event)) {
					const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
					const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
					condition.broadcaster_user_id = broadcasterId;

					const rewardId = this.getNodeParameter('rewardId', '') as string;
					if (rewardId && rewardId.trim() !== '') {
						condition.reward_id = rewardId;
					}
				}
				// Pattern 1: broadcaster only events (default)
				else if (BROADCASTER_ONLY_EVENTS.includes(event)) {
					const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
					const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
					condition.broadcaster_user_id = broadcasterId;
				}

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
