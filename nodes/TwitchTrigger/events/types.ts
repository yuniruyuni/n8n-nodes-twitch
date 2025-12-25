import type { ITriggerFunctions, IDataObject } from 'n8n-workflow';

/**
 * Function type for building EventSub condition objects based on event type.
 * Each event module exports a buildCondition function that conforms to this type.
 */
export type EventConditionBuilder = (context: ITriggerFunctions, event: string) => Promise<IDataObject>;
