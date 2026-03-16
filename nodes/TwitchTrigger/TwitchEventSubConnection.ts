import { LoggerProxy, type ITriggerFunctions, type IDataObject, sleep } from 'n8n-workflow';
import { EventSubWebSocket } from './EventSubWebSocket';
import { Subscription } from './Subscription';

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export class TwitchEventSubConnection {
	private ws: EventSubWebSocket;
	private subscription: Subscription;
	private closing = false;
	private reconnectAttempts = 0;

	constructor(
		private readonly trigger: ITriggerFunctions,
		event: string,
		clientId: string,
		private readonly onNotification: (data: IDataObject) => void,
	) {
		this.subscription = new Subscription(trigger, event, clientId);
		this.ws = this.createWebSocket();
	}

	async connect(): Promise<void> {
		await this.ws.connect();
	}

	async close(): Promise<void> {
		this.closing = true;
		const staticData = this.trigger.getWorkflowStaticData('node');
		if (staticData.subscriptionId) {
			await this.subscription.delete(staticData.subscriptionId as string);
			delete staticData.subscriptionId;
		}
		this.ws.close();
	}

	private createWebSocket(): EventSubWebSocket {
		return new EventSubWebSocket(
			async (sessionId) => this.handleSessionWelcome(sessionId),
			this.onNotification,
			(subId) => this.handleRevocation(subId),
			this.trigger.getWorkflow().id || '',
			() => this.handleDisconnect(),
		);
	}

	private async handleSessionWelcome(sessionId: string): Promise<void> {
		const staticData = this.trigger.getWorkflowStaticData('node');
		const subscriptionId = await this.subscription.create(sessionId);
		staticData.subscriptionId = subscriptionId;
		// Successful connection resets the reconnect counter
		this.reconnectAttempts = 0;
	}

	private handleRevocation(subscriptionId: string): void {
		const staticData = this.trigger.getWorkflowStaticData('node');
		if (subscriptionId === staticData.subscriptionId) {
			delete staticData.subscriptionId;
		}
	}

	private handleDisconnect(): void {
		if (this.closing) {
			return;
		}

		if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			LoggerProxy.error(
				'Twitch EventSub WebSocket: max reconnect attempts reached, giving up',
				{
					workflowId: this.trigger.getWorkflow().id,
					nodeType: 'n8n-nodes-twitch.twitchTrigger',
					attempts: this.reconnectAttempts,
				},
			);
			return;
		}

		this.reconnectAttempts++;
		const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1);

		LoggerProxy.warn(
			`Twitch EventSub WebSocket disconnected, reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
			{
				workflowId: this.trigger.getWorkflow().id,
				nodeType: 'n8n-nodes-twitch.twitchTrigger',
			},
		);

		void sleep(delay).then(() => {
			if (this.closing) {
				return;
			}
			void this.reconnect();
		});
	}

	private async reconnect(): Promise<void> {
		try {
			// Clean up old subscription
			const staticData = this.trigger.getWorkflowStaticData('node');
			if (staticData.subscriptionId) {
				await this.subscription.delete(staticData.subscriptionId as string);
				delete staticData.subscriptionId;
			}

			// Create new WebSocket (new session → new subscription via handleSessionWelcome)
			this.ws = this.createWebSocket();
			await this.ws.connect();
		} catch (error) {
			LoggerProxy.error('Twitch EventSub WebSocket reconnection failed', {
				error: error instanceof Error ? error.message : String(error),
				workflowId: this.trigger.getWorkflow().id,
				nodeType: 'n8n-nodes-twitch.twitchTrigger',
				attempt: this.reconnectAttempts,
			});
			// Trigger another reconnect attempt
			this.handleDisconnect();
		}
	}
}
