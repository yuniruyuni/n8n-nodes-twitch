import type { IHookFunctions, IDataObject } from 'n8n-workflow';

/**
 * Function type for building EventSub condition objects based on event type.
 * Each event module exports a buildCondition function that conforms to this type.
 */
export type EventConditionBuilder = (context: IHookFunctions, event: string) => Promise<IDataObject>;
