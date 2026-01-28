import {
	LoggerProxy,
	NodeOperationError,
	type ITriggerFunctions,
	type IDataObject,
	ApplicationError,
} from 'n8n-workflow';
import { eventConditionBuilders } from './events/conditionBuilders';

export class Subscription {
	constructor(
		private readonly trigger: ITriggerFunctions,
		private readonly event: string,
		private readonly clientId: string,
	) {}

	async create(sessionId: string): Promise<string> {
		const buildCondition = eventConditionBuilders.get(this.event);
		if (!buildCondition) {
			throw new ApplicationError(`No condition builder found for event: ${this.event}`);
		}

		const condition = await buildCondition(this.trigger, this.event);

		const requestBody = {
			type: this.event,
			version: '1',
			condition,
			transport: {
				method: 'websocket',
				session_id: sessionId,
			},
		};

		try {
			const response = await this.trigger.helpers.httpRequestWithAuthentication.call(
				this.trigger,
				'twitchUserOAuth2Api',
				{
					method: 'POST',
					url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
					headers: {
						'Client-ID': this.clientId,
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

			LoggerProxy.error('Failed to create Twitch EventSub subscription', {
				error: errorMessage,
				event: this.event,
				workflowId: this.trigger.getWorkflow().id,
				nodeType: 'n8n-nodes-twitch.twitchTrigger',
			});

			throw new NodeOperationError(
				this.trigger.getNode(),
				`Failed to create Twitch EventSub subscription: ${errorMessage}`,
			);
		}
	}

	async delete(subscriptionId: string): Promise<void> {
		try {
			await this.trigger.helpers.httpRequestWithAuthentication.call(
				this.trigger,
				'twitchUserOAuth2Api',
				{
					method: 'DELETE',
					url: `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`,
					headers: {
						'Client-ID': this.clientId,
					},
				},
			);
		} catch (error) {
			LoggerProxy.warn('Failed to delete EventSub subscription during workflow deactivation', {
				error: error instanceof Error ? error.message : String(error),
				subscriptionId,
				workflowId: this.trigger.getWorkflow().id,
				nodeType: 'n8n-nodes-twitch.twitchTrigger',
			});
		}
	}
}
