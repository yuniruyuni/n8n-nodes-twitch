import type { INodeProperties, IDisplayOptions } from 'n8n-workflow';

/**
 * Applies display options to all properties in the array
 * Based on n8n's updateDisplayOptions utility pattern
 */
export function updateDisplayOptions(
	displayOptions: IDisplayOptions,
	properties: INodeProperties[],
): INodeProperties[] {
	return properties.map((property) => {
		return {
			...property,
			displayOptions: displayOptions,
		};
	});
}
