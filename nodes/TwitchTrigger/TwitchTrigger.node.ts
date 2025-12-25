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
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Channel Ban',
						value: 'channel.ban',
					},
					{
						name: 'Channel Channel Points Custom Reward Add',
						value: 'channel.channel_points_custom_reward.add',
					},
					{
						name: 'Channel Channel Points Custom Reward Redemption Add',
						value: 'channel.channel_points_custom_reward_redemption.add',
					},
					{
						name: 'Channel Channel Points Custom Reward Redemption Update',
						value: 'channel.channel_points_custom_reward_redemption.update',
					},
					{
						name: 'Channel Channel Points Custom Reward Remove',
						value: 'channel.channel_points_custom_reward.remove',
					},
					{
						name: 'Channel Channel Points Custom Reward Update',
						value: 'channel.channel_points_custom_reward.update',
					},
					{
						name: 'Channel Chat Clear',
						value: 'channel.chat.clear',
					},
					{
						name: 'Channel Chat Clear User Messages',
						value: 'channel.chat.clear_user_messages',
					},
					{
						name: 'Channel Chat Message',
						value: 'channel.chat.message',
					},
					{
						name: 'Channel Chat Message Delete',
						value: 'channel.chat.message_delete',
					},
					{
						name: 'Channel Chat Notification',
						value: 'channel.chat.notification',
					},
					{
						name: 'Channel Cheer',
						value: 'channel.cheer',
					},
					{
						name: 'Channel Follow',
						value: 'channel.follow',
					},
					{
						name: 'Channel Goal Begin',
						value: 'channel.goal.begin',
					},
					{
						name: 'Channel Goal End',
						value: 'channel.goal.end',
					},
					{
						name: 'Channel Goal Progress',
						value: 'channel.goal.progress',
					},
					{
						name: 'Channel Hype Train Begin',
						value: 'channel.hype_train.begin',
					},
					{
						name: 'Channel Hype Train End',
						value: 'channel.hype_train.end',
					},
					{
						name: 'Channel Hype Train Progress',
						value: 'channel.hype_train.progress',
					},
					{
						name: 'Channel Moderator Add',
						value: 'channel.moderator.add',
					},
					{
						name: 'Channel Moderator Remove',
						value: 'channel.moderator.remove',
					},
					{
						name: 'Channel Poll Begin',
						value: 'channel.poll.begin',
					},
					{
						name: 'Channel Poll End',
						value: 'channel.poll.end',
					},
					{
						name: 'Channel Poll Progress',
						value: 'channel.poll.progress',
					},
					{
						name: 'Channel Prediction Begin',
						value: 'channel.prediction.begin',
					},
					{
						name: 'Channel Prediction End',
						value: 'channel.prediction.end',
					},
					{
						name: 'Channel Prediction Lock',
						value: 'channel.prediction.lock',
					},
					{
						name: 'Channel Prediction Progress',
						value: 'channel.prediction.progress',
					},
					{
						name: 'Channel Raid',
						value: 'channel.raid',
					},
					{
						name: 'Channel Shield Mode Begin',
						value: 'channel.shield_mode.begin',
					},
					{
						name: 'Channel Shield Mode End',
						value: 'channel.shield_mode.end',
					},
					{
						name: 'Channel Shoutout Create',
						value: 'channel.shoutout.create',
					},
					{
						name: 'Channel Shoutout Receive',
						value: 'channel.shoutout.receive',
					},
					{
						name: 'Channel Subscribe',
						value: 'channel.subscribe',
					},
					{
						name: 'Channel Subscription End',
						value: 'channel.subscription.end',
					},
					{
						name: 'Channel Subscription Gift',
						value: 'channel.subscription.gift',
					},
					{
						name: 'Channel Subscription Message',
						value: 'channel.subscription.message',
					},
					{
						name: 'Channel Unban',
						value: 'channel.unban',
					},
					{
						name: 'Channel Update',
						value: 'channel.update',
					},
					{
						name: 'Stream Offline',
						value: 'stream.offline',
					},
					{
						name: 'Stream Online',
						value: 'stream.online',
					},
				],
				default: 'stream.online',
				description: 'The EventSub event to listen for',
			},
			{
				displayName: 'Broadcaster ID or Username',
				name: 'broadcasterId',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username to monitor. If a username is provided, it will be automatically converted to user ID.',
				displayOptions: {
					hide: {
						event: ['channel.raid'],
					},
				},
			},
			{
				displayName: 'Raid Direction',
				name: 'raidDirection',
				type: 'options',
				options: [
					{
						name: 'Incoming (To Broadcaster)',
						value: 'to',
						description: 'Receive raids to this broadcaster',
					},
					{
						name: 'Outgoing (From Broadcaster)',
						value: 'from',
						description: 'Monitor raids from this broadcaster',
					},
				],
				default: 'to',
				description: 'Whether to monitor incoming or outgoing raids',
				displayOptions: {
					show: {
						event: ['channel.raid'],
					},
				},
			},
			{
				displayName: 'Broadcaster ID or Username',
				name: 'raidBroadcasterId',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. 123456789 or username',
				description: 'The broadcaster user ID or username for raid events',
				displayOptions: {
					show: {
						event: ['channel.raid'],
					},
				},
			},
			{
				displayName: 'Moderator ID or Username',
				name: 'moderatorId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123456789 or username',
				description: 'The moderator user ID or username. If a username is provided, it will be automatically converted to user ID. Leave empty to use broadcaster ID.',
				displayOptions: {
					show: {
						event: ['channel.follow'],
					},
				},
			},
			{
				displayName: 'User ID or Username',
				name: 'userId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123456789 or username',
				description: 'The user ID or username for chat events. If a username is provided, it will be automatically converted to user ID. Leave empty to monitor all users.',
				displayOptions: {
					show: {
						event: [
							'channel.chat.clear',
							'channel.chat.clear_user_messages',
							'channel.chat.message',
						],
					},
				},
			},
			{
				displayName: 'Reward ID',
				name: 'rewardId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 92af127c-7326-4483-a52b-b0da0be61c01',
				description: 'The channel points custom reward ID. Leave empty to monitor all rewards.',
				displayOptions: {
					show: {
						event: [
							'channel.channel_points_custom_reward_redemption.add',
							'channel.channel_points_custom_reward_redemption.update',
						],
					},
				},
			},
		],
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

				// Build condition based on event type and available parameters
				if (event === 'channel.raid') {
					// Raid events use either to_broadcaster_user_id or from_broadcaster_user_id
					const raidDirection = this.getNodeParameter('raidDirection') as string;
					const raidBroadcasterIdInput = this.getNodeParameter('raidBroadcasterId') as string;
					const raidBroadcasterId = await resolveUserIdOrUsername.call(this, raidBroadcasterIdInput);

					if (raidDirection === 'to') {
						condition.to_broadcaster_user_id = raidBroadcasterId;
					} else {
						condition.from_broadcaster_user_id = raidBroadcasterId;
					}
				} else if (event === 'channel.follow') {
					// Follow events require both broadcaster_user_id and moderator_user_id
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
				} else if (
					event === 'channel.chat.clear' ||
					event === 'channel.chat.clear_user_messages' ||
					event === 'channel.chat.message'
				) {
					// Chat events require broadcaster_user_id and user_id
					const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
					const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
					condition.broadcaster_user_id = broadcasterId;

					const userIdInput = this.getNodeParameter('userId') as string;
					condition.user_id = await resolveUserIdOrUsername.call(this, userIdInput);
				} else if (
					event === 'channel.channel_points_custom_reward_redemption.add' ||
					event === 'channel.channel_points_custom_reward_redemption.update'
				) {
					// Reward redemption events can optionally filter by reward_id
					const broadcasterIdInput = this.getNodeParameter('broadcasterId') as string;
					const broadcasterId = await resolveUserIdOrUsername.call(this, broadcasterIdInput);
					condition.broadcaster_user_id = broadcasterId;

					const rewardId = this.getNodeParameter('rewardId', '') as string;
					if (rewardId && rewardId.trim() !== '') {
						condition.reward_id = rewardId;
					}
				} else {
					// Default: most events use only broadcaster_user_id
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
