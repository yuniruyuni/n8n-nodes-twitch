import {
	NodeConnectionTypes,
	type ITriggerFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IDataObject,
	type ITriggerResponse,
} from 'n8n-workflow';
import { triggerProperties } from './events';
import { TwitchEventSubConnection } from './TwitchEventSubConnection';

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

		const onNotification = (eventData: IDataObject) => {
			this.emit([this.helpers.returnJsonArray([eventData])]);
		};

		const connection = new TwitchEventSubConnection(this, event, clientId, onNotification);

		await connection.connect();

		const closeFunction = async () => {
			await connection.close();
		};

		return {
			closeFunction,
		};
	}
}
