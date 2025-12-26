/**
 * Twitch API Pagination Configuration
 *
 * Twitch uses cursor-based pagination with the following pattern:
 * - Request: ?first=100&after=cursor
 * - Response: { data: [...], pagination: { cursor: "..." } }
 *
 * Note: Twitch API uses `first` parameter for page size regardless of whether
 * using `after` (forward) or `before` (backward) cursors.
 *
 * This module provides limit-based pagination with automatic page calculation.
 */

import type { IN8nRequestOperationPaginationGeneric } from 'n8n-workflow';

/**
 * Creates pagination configuration with automatic limit-based page fetching
 *
 * Supports two modes:
 * 1. Limited mode: Fetches up to 'limit' results
 * 2. Unlimited mode: Fetches all available results when 'returnAll' is true
 *
 * Automatically calculates optimal page size and number of pages needed:
 * - Page size = min(limit, apiMaxPageSize) when limited
 * - Page size = apiMaxPageSize when unlimited
 * - Pages needed = ceil(limit / apiMaxPageSize) when limited, or infinite when unlimited
 *
 * @param apiMaxPageSize - Maximum items per page supported by API (e.g., 100, 1000)
 * @returns Pagination configuration with early stopping or unlimited fetching
 *
 * @example
 * routing: {
 *   send: {
 *     preSend: [
 *       async function(this, requestOptions) {
 *         const returnAll = this.getNodeParameter('returnAll', false) as boolean;
 *         const limit = returnAll ? 100 : this.getNodeParameter('limit', 100) as number;
 *         requestOptions.qs = {
 *           first: returnAll ? 100 : Math.min(limit, 100)
 *         };
 *         return requestOptions;
 *       }
 *     ]
 *   },
 *   operations: {
 *     pagination: createLimitBasedPagination(100)
 *   },
 *   output: {
 *     postReceive: [
 *       { type: 'rootProperty', properties: { property: 'data' } },
 *       {
 *         type: 'limit',
 *         properties: {
 *           maxResults: '={{$parameter.returnAll ? undefined : $parameter.limit}}'
 *         }
 *       }
 *     ]
 *   }
 * }
 */
export function createLimitBasedPagination(
	apiMaxPageSize: number,
): IN8nRequestOperationPaginationGeneric {
	return {
		type: 'generic' as const,
		properties: {
			// Continue if:
			// 1. Cursor exists (more data available)
			// 2. Either returnAll is true, OR page count < estimated max pages needed
			continue: `={{
				$response.body.pagination?.cursor !== undefined &&
				($parameter.returnAll === true || $pageCount < Math.ceil($parameter.limit / ${apiMaxPageSize}))
			}}`,
			// Add cursor to next request
			request: {
				qs: {
					after: '={{$response.body.pagination.cursor}}',
				},
			},
		},
	};
}
