import { type ITriggerFunctions, type IDataObject } from 'n8n-workflow';
import { EventSubWebSocket } from './EventSubWebSocket';
import { Subscription } from './Subscription';

export class TwitchEventSubConnection {
	private ws: EventSubWebSocket;
	private subscription: Subscription;

	constructor(
		private readonly trigger: ITriggerFunctions,
		event: string,
		clientId: string,
		onNotification: (data: IDataObject) => void,
	) {
		this.subscription = new Subscription(trigger, event, clientId);

		this.ws = new EventSubWebSocket(
			async (sessionId) => this.handleSessionWelcome(sessionId),
			onNotification,
			(subId) => this.handleRevocation(subId),
			trigger.getWorkflow().id || '',
		);
	}

	async connect(): Promise<void> {
		await this.ws.connect();
	}

	async close(): Promise<void> {
		const staticData = this.trigger.getWorkflowStaticData('node');
		if (staticData.subscriptionId) {
			await this.subscription.delete(staticData.subscriptionId as string);
			delete staticData.subscriptionId;
		}
		this.ws.close();
	}

	private async handleSessionWelcome(sessionId: string): Promise<void> {
		const staticData = this.trigger.getWorkflowStaticData('node');
		const subscriptionId = await this.subscription.create(sessionId);
		staticData.subscriptionId = subscriptionId;
	}

	private handleRevocation(subscriptionId: string): void {
		const staticData = this.trigger.getWorkflowStaticData('node');
		if (subscriptionId === staticData.subscriptionId) {
			delete staticData.subscriptionId;
		}
	}
}
