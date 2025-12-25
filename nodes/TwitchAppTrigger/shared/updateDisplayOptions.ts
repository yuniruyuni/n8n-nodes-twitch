import type { IDisplayOptions, INodeProperties } from 'n8n-workflow';

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
