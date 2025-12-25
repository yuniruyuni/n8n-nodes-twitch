import {
	ApplicationError,
	NodeConnectionTypes,
	type ITriggerFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IDataObject,
	type ITriggerResponse,
} from 'n8n-workflow';
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
		description: 'Listen to Twitch EventSub notifications via WebSocket',
		defaults: {
			name: 'Twitch Trigger',
		},
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'twitchUserOAuth2Api',
				required: true,
			},
		],
		properties: triggerProperties,
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const event = this.getNodeParameter('event') as string;
		const credentials = await this.getCredentials('twitchUserOAuth2Api');
		const clientId = credentials.clientId as string;
		const workflowStaticData = this.getWorkflowStaticData('node');

		let ws: WebSocket | null = null;
		let sessionId: string | null = null;
		let subscriptionId: string | null = null;
		let reconnectUrl: string | null = null;
		let isClosing = false;

		// Build condition using event-specific builder function
		const buildCondition = eventConditionBuilders.get(event);
		if (!buildCondition) {
			throw new ApplicationError(`No condition builder found for event: ${event}`);
		}

		const createSubscription = async (sid: string): Promise<string> => {
			const condition = await buildCondition(this, event);

			const requestBody = {
				type: event,
				version: '1',
				condition,
				transport: {
					method: 'websocket',
					session_id: sid,
				},
			};

			try {
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'twitchUserOAuth2Api',
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
				return subscription.id as string;
			} catch (error) {
				const errorData = error as {
					description?: string;
					message?: string;
				};

				const errorMessage = errorData.description || errorData.message || String(error);
				throw new ApplicationError(
					`Failed to create Twitch EventSub subscription: ${errorMessage}`,
				);
			}
		};

		const deleteSubscription = async (subId: string): Promise<void> => {
			try {
				await this.helpers.httpRequestWithAuthentication.call(
					this,
					'twitchUserOAuth2Api',
					{
						method: 'DELETE',
						url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subId}`,
						headers: {
							'Client-ID': clientId,
						},
					},
				);
			} catch {
				// Ignore errors during cleanup
			}
		};

		const connectWebSocket = (url: string): Promise<void> => {
			return new Promise((resolve, reject) => {
				try {
					ws = new WebSocket(url);

					ws.onopen = () => {
						// Connection opened, wait for session_welcome
					};

					ws.onmessage = async (event: MessageEvent) => {
						try {
							const message = JSON.parse(event.data as string) as IDataObject;
							const metadata = message.metadata as IDataObject;
							const messageType = metadata.message_type as string;

							if (messageType === 'session_welcome') {
								// Receive session ID and create subscription
								const session = message.payload as IDataObject;
								const welcomeSession = session.session as IDataObject;
								sessionId = welcomeSession.id as string;

								// Create EventSub subscription
								subscriptionId = await createSubscription(sessionId);
								workflowStaticData.subscriptionId = subscriptionId;

								resolve();
							} else if (messageType === 'notification') {
								// Emit event data to workflow
								const payload = message.payload as IDataObject;
								const eventData = (payload.event as IDataObject) || {};
								this.emit([this.helpers.returnJsonArray([eventData])]);
							} else if (messageType === 'session_keepalive') {
								// Just keep the connection alive
							} else if (messageType === 'session_reconnect') {
								// Server requests reconnection
								const payload = message.payload as IDataObject;
								const reconnectSession = payload.session as IDataObject;
								reconnectUrl = reconnectSession.reconnect_url as string;

								// Close current connection and reconnect
								if (ws && !isClosing) {
									ws.close();
								}
							} else if (messageType === 'revocation') {
								// Subscription was revoked
								const payload = message.payload as IDataObject;
								const subscription = payload.subscription as IDataObject;
								if (subscription.id === subscriptionId) {
									subscriptionId = null;
									delete workflowStaticData.subscriptionId;
								}
							}
						} catch {
							// Silently ignore parsing errors and continue processing
						}
					};

					ws.onerror = () => {
						reject(new ApplicationError(`WebSocket error occurred`));
					};

					ws.onclose = async () => {
						if (isClosing) {
							return;
						}

						// Handle reconnection
						if (reconnectUrl) {
							const url = reconnectUrl;
							reconnectUrl = null;
							try {
								await connectWebSocket(url);
							} catch (error) {
								reject(error);
							}
						} else {
							// Unexpected close - connection lost
							// In production, n8n will restart the workflow if needed
							reject(
								new ApplicationError(
									'WebSocket connection closed unexpectedly. Workflow will be restarted.',
								),
							);
						}
					};
				} catch (error) {
					reject(error);
				}
			});
		};

		// Start WebSocket connection
		await connectWebSocket('wss://eventsub.wss.twitch.tv/ws');

		// Cleanup function
		const closeFunction = async () => {
			isClosing = true;

			// Delete subscription
			if (subscriptionId) {
				await deleteSubscription(subscriptionId);
				delete workflowStaticData.subscriptionId;
			}

			// Close WebSocket
			if (ws) {
				ws.close();
				ws = null;
			}
		};

		return {
			closeFunction,
		};
	}
}
