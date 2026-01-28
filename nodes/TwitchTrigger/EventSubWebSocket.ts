import { ApplicationError, LoggerProxy, type IDataObject } from 'n8n-workflow';

type SessionHandler = (sessionId: string) => Promise<void>;
type NotificationHandler = (data: IDataObject) => void;
type RevocationHandler = (subscriptionId: string) => void;

export class EventSubWebSocket {
	private ws: WebSocket | null = null;
	private reconnectUrl: string | null = null;
	private isClosing = false;
	constructor(
		private readonly onSessionWelcome: SessionHandler,
		private readonly onNotification: NotificationHandler,
		private readonly onRevocation: RevocationHandler,
		private readonly workflowId: string,
	) {}

	async connect(url: string = 'wss://eventsub.wss.twitch.tv/ws'): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.ws = new WebSocket(url);

				this.ws.onopen = () => {
					// Connection opened, wait for session_welcome
				};

				this.ws.onmessage = async (event: MessageEvent) => {
					try {
						const message = JSON.parse(event.data as string) as IDataObject;
						const metadata = message.metadata as IDataObject;
						const messageType = metadata.message_type as string;

						if (messageType === 'session_welcome') {
							const session = message.payload as IDataObject;
							const welcomeSession = session.session as IDataObject;
							const sessionId = welcomeSession.id as string;

							await this.onSessionWelcome(sessionId);
							resolve();
						} else if (messageType === 'notification') {
							const payload = message.payload as IDataObject;
							const eventData = (payload.event as IDataObject) || {};
							this.onNotification(eventData);
						} else if (messageType === 'session_keepalive') {
							// Just keep the connection alive
						} else if (messageType === 'session_reconnect') {
							const payload = message.payload as IDataObject;
							const reconnectSession = payload.session as IDataObject;
							this.reconnectUrl = reconnectSession.reconnect_url as string;

							if (this.ws && !this.isClosing) {
								this.ws.close();
							}
						} else if (messageType === 'revocation') {
							const payload = message.payload as IDataObject;
							const subscription = payload.subscription as IDataObject;
							this.onRevocation(subscription.id as string);
						}
					} catch (error) {
						LoggerProxy.debug('Failed to parse WebSocket message from Twitch EventSub', {
							error: error instanceof Error ? error.message : String(error),
							rawMessage: event.data as string,
							workflowId: this.workflowId,
							nodeType: 'n8n-nodes-twitch.twitchTrigger',
						});
					}
				};

				this.ws.onerror = () => {
					reject(new ApplicationError('WebSocket error occurred'));
				};

				this.ws.onclose = async () => {
					if (this.isClosing) {
						return;
					}

					if (this.reconnectUrl) {
						const nextUrl = this.reconnectUrl;
						this.reconnectUrl = null;
						try {
							await this.connect(nextUrl);
						} catch (error) {
							reject(error);
						}
					} else {
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
	}

	close() {
		this.isClosing = true;
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}
