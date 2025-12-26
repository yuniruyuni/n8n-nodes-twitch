import { ApplicationError } from 'n8n-workflow';

/**
 * Validates that a required field is not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @returns The trimmed value
 * @throws ApplicationError if value is empty or whitespace
 */
export function validateRequired(value: string, fieldName: string): string {
	if (!value || value.trim() === '') {
		throw new ApplicationError(`${fieldName} is required`);
	}
	return value.trim();
}

/**
 * Validates that a number is within a specified range
 * @param value - The number to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param fieldName - The name of the field for error messages
 * @throws ApplicationError if value is outside the range
 */
export function validateRange(
	value: number,
	min: number,
	max: number,
	fieldName: string,
): void {
	if (value < min || value > max) {
		throw new ApplicationError(`${fieldName} must be between ${min} and ${max}`);
	}
}

/**
 * Validates and trims an optional string value
 * Returns undefined if empty, otherwise returns trimmed value
 * @param value - The optional value to validate
 * @returns The trimmed value or undefined
 */
export function validateOptional(value: string | undefined): string | undefined {
	if (!value || value.trim() === '') {
		return undefined;
	}
	return value.trim();
}

/**
 * Parses and validates a comma-separated list
 * @param value - Comma-separated string
 * @returns Array of trimmed non-empty values
 */
export function parseCommaSeparated(value: string): string[] {
	if (!value || value.trim() === '') {
		return [];
	}
	return value
		.split(',')
		.map((v) => v.trim())
		.filter((v) => v !== '');
}
