import type { INodeProperties, IDisplayOptions } from 'n8n-workflow';

/**
 * Applies display options to all properties in the array
 * Based on n8n's updateDisplayOptions utility pattern
 * Merges with existing displayOptions if present
 */
export function updateDisplayOptions(
	displayOptions: IDisplayOptions,
	properties: INodeProperties[],
): INodeProperties[] {
	return properties.map((property) => {
		// Merge displayOptions if the property already has some
		if (property.displayOptions) {
			const merged: IDisplayOptions = {};

			// Merge 'show' conditions
			if (displayOptions.show || property.displayOptions.show) {
				merged.show = {
					...(displayOptions.show || {}),
					...(property.displayOptions.show || {}),
				};
			}

			// Merge 'hide' conditions
			if (displayOptions.hide || property.displayOptions.hide) {
				merged.hide = {
					...(displayOptions.hide || {}),
					...(property.displayOptions.hide || {}),
				};
			}

			return {
				...property,
				displayOptions: merged,
			};
		}

		// Otherwise, just apply the new displayOptions
		return {
			...property,
			displayOptions: displayOptions,
		};
	});
}
