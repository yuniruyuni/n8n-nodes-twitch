# ADR 002: Limit-Based Automatic Pagination

## Status

Accepted

## Date

2025-12-27

## Context

The Twitch API uses cursor-based pagination for most list endpoints. Initially, we exposed pagination parameters (`first`, `after`, `before`) directly to users, requiring them to manually manage cursors and page sizes. This created a complex user experience and required users to understand API-specific pagination mechanics.

### Problems with Manual Pagination

1. **Complex UX**: Users had to understand and manage cursor tokens
2. **Inconsistent patterns**: Different operations had different pagination parameters
3. **Inefficient**: Users needed to set optimal page sizes manually
4. **Error-prone**: Easy to make mistakes with cursor management

### Twitch API Pagination Behavior

After investigating the Twitch API documentation, we discovered:

- **Page size parameter**: Always `first` (not `last`), regardless of cursor direction
- **Cursor parameters**: `after` for forward pagination, `before` for backward pagination
- **No native forward/backward support**: Twitch API does not have a concept of "forward" vs "backward" ordering modes
- **Response format**: `{ data: [...], pagination: { cursor: "..." } }`
- **API limits**: Vary by endpoint (100 for most, 1000 for some like chatters)

## Decision

We have implemented **automatic limit-based pagination** with the following design:

### 1. User-Facing Parameters

**`returnAll` boolean parameter**:
- When `true`: Fetches all available results by continuing pagination until no cursor is returned
- When `false`: Uses `limit` parameter to control result count
- Default: `false`
- Description: "Whether to return all results or only up to a given limit. When enabled, pagination will automatically continue until all data is retrieved."
- UI behavior: When enabled, `limit` parameter is hidden

**`limit` number parameter**:
- Represents the total number of results the user wants
- Only visible when `returnAll` is `false`
- No manual cursor management required
- Clear, intuitive interface

**No `order`/`direction` parameter**:
- Twitch API does not support forward/backward ordering modes
- All pagination uses `after` cursor with `first` parameter

### 2. Internal Implementation

**Optimal page size calculation**:
```typescript
const returnAll = this.getNodeParameter('returnAll', false) as boolean;
const limit = returnAll ? apiMaxPageSize : (this.getNodeParameter('limit', DEFAULT) as number);
pageSize = returnAll ? apiMaxPageSize : Math.min(limit, apiMaxPageSize)
```

**Automatic page fetching**:
- Continue condition: `$parameter.returnAll === true || $pageCount < Math.ceil($parameter.limit / apiMaxPageSize)`
- When `returnAll` is true: Continues until `cursor` is `undefined` (no more data)
- When `returnAll` is false: Stops early when limit is reached or no more data available
- Uses n8n's built-in `routing.operations.pagination` feature

**Result trimming**:
- `output.maxResults` set to `{{$parameter.returnAll ? undefined : $parameter.limit}}`
- When `returnAll` is true: No trimming (returns all fetched results)
- When `returnAll` is false: Ensures exactly `limit` items are returned

### 3. Architecture Components

**`shared/pagination.ts`**:
```typescript
export function createLimitBasedPagination(
  apiMaxPageSize: number
): IN8nRequestOperationPaginationGeneric
```

**Parameters**:
- `apiMaxPageSize`: Maximum items per page for the specific API endpoint

**Returns**: n8n pagination configuration with:
- Continue expression supporting both `returnAll` and limit-based pagination
- Early stopping based on page count estimation (when `returnAll` is false)
- Unlimited pagination (when `returnAll` is true)
- Automatic cursor management via `after` parameter

### 4. Implementation Pattern

Each paginated operation follows this pattern:

**Field definitions**:
```typescript
{
  displayName: 'Return All',
  name: 'returnAll',
  type: 'boolean',
  default: false,
  description: 'Whether to return all results or only up to a given limit. When enabled, pagination will automatically continue until all data is retrieved.',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      returnAll: [false],  // Only shown when returnAll is false
    },
  },
  default: 100,
  typeOptions: { minValue: 1 },
  description: 'Maximum number of results to return. If this exceeds the API page size, multiple pages will be fetched automatically until the limit is reached or all data is retrieved.',
}
```

**Routing configuration**:
```typescript
routing: {
  send: {
    preSend: [
      async function(this, requestOptions) {
        const returnAll = this.getNodeParameter('returnAll', false) as boolean;
        const limit = returnAll ? API_MAX_PAGE_SIZE : (this.getNodeParameter('limit', 100) as number);
        requestOptions.qs = {
          // Optimal page size: API max when returnAll, otherwise min(limit, API max)
          first: returnAll ? API_MAX_PAGE_SIZE : Math.min(limit, API_MAX_PAGE_SIZE)
        };
        return requestOptions;
      }
    ]
  },
  operations: {
    pagination: createLimitBasedPagination(API_MAX_PAGE_SIZE)
  },
  output: {
    postReceive: [
      { type: 'rootProperty', properties: { property: 'data' } },
      { type: 'limit', properties: { maxResults: '={{$parameter.returnAll ? undefined : $parameter.limit}}' } }
    ]
  }
}
```

## Consequences

### Positive

1. **Simplified UX**: Users choose between "all results" or "limited results" with a simple boolean
2. **Flexible control**: `returnAll` for convenience, `limit` for precision
3. **Automatic optimization**: System calculates optimal page sizes
4. **Efficient API usage**: Minimizes requests while reaching limit quickly
5. **Consistent pattern**: All paginated operations work the same way
6. **Early stopping**: Prevents unnecessary API calls when limit is reached
7. **Conditional UI**: `limit` parameter hidden when not needed
8. **n8n Cloud compatible**: Uses native n8n features, no external dependencies

### Negative

1. **Load consideration**: `returnAll` may create high load on Twitch API for large datasets
1. **API max page sizes**: Hardcoded per endpoint (100 or 1000), requires maintenance if API changes
2. **No backward pagination**: Accepted as Twitch API limitation

## Examples

### Example 1: User sets returnAll=true (API max: 100, total available: 350)

1. First request: `?first=100` → Returns 100 items + cursor
2. Second request: `?first=100&after=cursor1` → Returns 100 items + cursor
3. Third request: `?first=100&after=cursor2` → Returns 100 items + cursor
4. Fourth request: `?first=100&after=cursor3` → Returns 50 items + no cursor
5. Continue condition: `returnAll === true` but cursor is undefined → Stop
6. Output: All 350 items (no trimming)

### Example 2: User sets returnAll=false, limit=250 (API max: 100)

1. First request: `?first=100` → Returns 100 items + cursor
2. Second request: `?first=100&after=cursor1` → Returns 100 items + cursor
3. Third request: `?first=100&after=cursor2` → Returns 100 items + cursor
4. Page count (3) >= ceil(250/100) (3) → Stop
5. Output trimmed to exactly 250 items

### Example 3: User sets returnAll=false, limit=50 (API max: 100)

1. Single request: `?first=50` → Returns 50 items (no cursor or cursor ignored)
2. Page count (1) >= ceil(50/100) (1) → Stop
3. Output: exactly 50 items

## References

- [Twitch API Pagination Documentation](https://dev.twitch.tv/docs/api/guide#pagination)