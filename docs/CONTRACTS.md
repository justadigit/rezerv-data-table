# DataTable behavioral contract — v1

This document owns generic table behavior. It specifies outcomes, not implementation code. Type examples are illustrative and may be refined without weakening the behaviors below. See [requirements](REQUIREMENTS.md) for assessment priority.

## Generic API and identity

The table is generic in `TRow` and `TChild`; child shape may differ from the parent. The Phase 2 public entry point exports `DataTableProps<TRow, TChild>`, `ColumnDef<TRow>`, `CellContext<TRow>`, `RowId`, `SortDirection`, `SortingState`, `PaginationState`, and `ExpansionConfig<TRow, TChild>`. Feature models never appear in the generic module. Core prop names are `data`, `columns`, `getRowId`, `sorting`/`defaultSorting`, `onSortingChange`, `pagination`/`defaultPagination`, `onPaginationChange`, `manualSorting`, `manualPagination`, `totalCount`, `pageSizeOptions`, `loading`, `error`, and `expansion`. Controlled values require their change callbacks. Manual sorting requires parent-owned sorting and its callback; manual pagination also requires parent-owned pagination, `totalCount`, and `manualSorting: true` so a current server page cannot be sorted as a full dataset.

The caller supplies `getRowId(row)`, returning a stable string or number unique across the active dataset and across server pages. This ID keys rendering, expansion, async status, and cache. Array indexes are never identities. Changing a row's semantic ID is treated as a new row. Duplicate IDs violate the caller contract; development builds should surface a clear diagnostic rather than silently mixing row states.

## Column definitions

Each column declares a stable, unique `id`, a header label, an optional `accessorKey` for direct `TRow` field access or `accessor` for a derived value, an optional custom cell renderer, a sortable flag, width, and a left-pinned flag. `id` identifies the column for sorting and accessibility references; it need not be a row property. For example, an `attendance` column may derive its value from attendee count and capacity. Width must be resolvable for pinned offset calculation. A sortable column needs a deterministic sortable value or comparison strategy; visual cell content alone is not a sort value. Custom renderers can receive row and value but must not require feature knowledge inside the table. If a `columnId` is unknown or identifies a non-sortable column, a sort request is ignored safely. Header interactions use buttons and communicate current direction.

The identity/access distinction in `ColumnDef<TRow>` is:

```ts
id: string;
accessorKey?: keyof TRow;
accessor?: (row: TRow) => unknown;
```

## Sorting

`SortingState` represents either no sort (`null`) or one `{ columnId, direction }` with `direction` `asc` or `desc`. `columnId` matches a column's `id`, not its `accessorKey`. The same sortable header cycles `null → asc → desc → null`; a different sortable header starts at `asc`. Client sorting is stable for equal values and does not mutate the input array. The v1 default comparator uses numeric comparison for numbers, timestamp comparison for `Date` values, and `Intl.Collator` with numeric-friendly, case-insensitive behavior for strings. Nullish values sort after non-null values in either direction. A column-level row comparator takes precedence for complex or derived values when these defaults are unsuitable. Unsupported or mixed non-null value types preserve source order and yield no effective client sort. An unknown current `columnId` likewise resolves to an unsorted display in client mode without a crash or destructive parent-state update.

```ts
export type SortingState = {
  columnId: string;
  direction: "asc" | "desc";
} | null;
```

The client pipeline is **raw data → sorting → pagination → visible parent rows → expanded rendering**. Expansion never changes the number of parent rows used for pagination. Sorting changes request `pageIndex = 0`.

## Pagination and ownership

`PaginationState` is `{ pageIndex: number; pageSize: number }`: `pageIndex` is zero-based (`0` is the first page) and `pageSize` is positive. In client/uncontrolled mode, the table owns initial sorting and pagination, derives the total from raw data, and clamps an out-of-range `pageIndex` to the last valid index (or `0` for an empty dataset). The client slice starts at `pageIndex * pageSize`; the UI may display `pageIndex + 1`. Next and previous controls respect boundaries. Changing page size or sorting resets to `pageIndex = 0`. If a mocked external API numbers pages from one, convert at the service/API boundary; DataTable state remains zero-based.

```ts
export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};
```

In controlled/manual mode, the parent owns supplied sorting and pagination values and provides already processed page data and total parent-row count. The table emits proposed changes through callbacks and renders the latest supplied values; it does not sort or repaginate server-style input. If the parent does not accept a proposal, the visual state stays unchanged. Reset proposals on sort or page-size change include `pageIndex = 0`, but do not secretly alter the controlled `pageIndex`. For an out-of-range controlled `pageIndex`, render the parent-supplied rows and index as given, with navigation boundaries derived from the supplied total; the parent is responsible for reconciliation. The table must not double paginate already paged data.

Controlledness is explicit per state slice: a provided value and callback form a controlled slice; an omitted value uses internal state. Mixed ownership is allowed only if the processing mode remains unambiguous. Manual mode requires parent-provided total count and processed rows. The Phase 2 prop spelling above is the public type contract; rendering begins later.

## Expansion and row-local asynchronous state

`ExpansionConfig<TRow, TChild>` is discriminated by mode:

- **Inline:** Feature supplies child data with each parent (through a getter or equivalent). Expanding renders feature-supplied child content. An empty child list shows an explicit expansion empty state.
- **On demand:** Feature supplies a row-scoped async loader and child renderer. Each row transitions `idle → loading → success | empty success | error`; explicit retry transitions `error → loading`. Success and empty success are cacheable outcomes. An error offers a retry action. Loading is specific to that row, never global.

The table owns expansion buttons, expanded/collapsed state, async status, full-width container, and subtle transition. The feature owns attendee or other domain presentation and copy. One expanded row contributes a detail `<tr>` below its parent, with a cell spanning the effective table column count. A row may collapse while loading. **V1 assumption:** the request may complete and populate its cache while collapsed; it must not reopen the row. Re-expanding after success uses the cached result without refetching. Retry always starts a new request. If the data source or row identity changes, stale cache entries must be invalidated by a documented key or explicit reset boundary. A per-row request version and/or cancellation prevents older responses from overwriting a newer request, error, or dataset state. Unmounting must not produce a state update or warning. No unrequested automatic retry is implied.

Keep table-level loading/error separate from expansion-level loading/error. The animation must not break semantic table structure, pinned cells, or keyboard interaction. Honor reduced-motion preference as a project usability assumption.

## Left-pinned columns

Only left pinning is in v1. For multiple pinned columns, each sticky left offset equals the sum of preceding pinned widths. Pinned header and body cells have opaque backgrounds and deliberate z-index layering; a boundary divider or shadow appears when horizontal content moves beneath them. The horizontal scroll container preserves the full table on narrow screens. No right-pinned behavior is promised.

## Rendering states and precedence

At table level, explicit initial `loading` takes precedence over error, empty, and success and renders column-matched skeleton rows. When loading ends, an error takes precedence over empty; otherwise zero parent rows show empty; remaining rows show success. A slow request visibly enters loading. The table does not guess loading from an empty data array. Expansion state is rendered only for visible expanded rows and has its own loading, error, empty, and success views; parent rows may remain visible during child loading. Exact visual copy is feature-owned or supplied through generic render slots, not hard-coded domain text.

## Accessibility and invalid states

Use semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, and row/cell markup. Sorting and expansion controls are keyboard-operable buttons with visible focus. Apply `aria-sort` to the active sortable header (`ascending` or `descending`; otherwise `none` where useful), `aria-expanded` to expansion buttons, and a stable `aria-controls` relationship when expanded content has an ID. Loading and errors need understandable text/status, not color alone. Do not use clickable `div` controls.

An unknown `columnId` or non-sortable sort request never crashes. An out-of-range client `pageIndex` is normalized; a controlled `pageIndex` is not silently rewritten. A missing or duplicate row ID is a caller contract violation to diagnose. Empty columns and nonpositive/nonfinite page sizes are invalid caller configuration and should fail clearly in development before user interaction.

## Reuse and performance

The class timetable and a second differently shaped dataset consume the same generic public API. The second demo exercises controlled/manual sort and pagination and on-demand expansion through mocked service responses, without table edits. Use stable column definitions and row IDs, derive sorting efficiently, limit rendered parents by pagination, and isolate row-local expansion state. Do not build virtualization or scatter memoization without profiling evidence.
