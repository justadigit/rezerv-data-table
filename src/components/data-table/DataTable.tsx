import { useState, type CSSProperties } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SortAscendingIcon, SortDescendingIcon, SortIcon } from "@/design";
import { isSortableColumn, validateColumns } from "./dataTable.column";
import { assertPageSize, defaultPagination } from "./dataTable.pagination";
import { processRows } from "./dataTable.process";
import { nextSortingState } from "./dataTable.sorting";
import { useControllableState, withSortingChange } from "./dataTable.state";
import type { ColumnDef, DataTableProps, SortingState } from "./dataTable.type";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableRows } from "./DataTableRows";

const DEFAULT_COLUMN_WIDTH = 176;
const SKELETON_ROW_COUNT = 4;
const DEFAULT_PAGE_SIZES = [10, 20, 50] as const;

function columnLayout<TRow>(columns: readonly ColumnDef<TRow>[]) {
  let left = 0;
  const lastPinnedIndex = columns.reduce(
    (last, column, index) => (column.pinned === "left" ? index : last),
    -1,
  );
  return columns.map((column, index) => {
    const width = Math.max(
      column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH,
      column.minWidth ?? 0,
    );
    if (
      !Number.isFinite(width) ||
      width <= 0 ||
      (column.width !== undefined &&
        (!Number.isFinite(column.width) || column.width <= 0)) ||
      (column.minWidth !== undefined &&
        (!Number.isFinite(column.minWidth) || column.minWidth <= 0))
    ) {
      throw new Error(
        `DataTable column "${column.id}" requires a positive finite width`,
      );
    }
    if (
      column.pinned === "left" &&
      (column.width === undefined ||
        (column.minWidth !== undefined && column.minWidth > column.width))
    ) {
      throw new Error(
        `DataTable pinned column "${column.id}" requires an explicit width`,
      );
    }
    const pinnedLeft = column.pinned === "left" ? left : undefined;
    if (pinnedLeft !== undefined) left += column.width!;
    return {
      width,
      minWidth: column.minWidth ?? width,
      pinnedLeft,
      boundary: index === lastPinnedIndex,
    };
  });
}

export function DataTable<TRow, TChild = never>(
  props: DataTableProps<TRow, TChild>,
) {
  const [sorting, setSorting] = useControllableState<SortingState>({
    value: props.sorting,
    defaultValue: props.defaultSorting ?? null,
    onChange: props.onSortingChange,
  });
  const [pagination, setPagination] = useControllableState({
    value: props.pagination,
    defaultValue: props.defaultPagination ?? defaultPagination,
    onChange: props.onPaginationChange,
  });
  const [scrolled, setScrolled] = useState(false);
  validateColumns(props.columns);
  props.pageSizeOptions?.forEach(assertPageSize);
  const layout = columnLayout(props.columns);
  const processed =
    props.loading || props.error
      ? null
      : props.manualPagination
        ? processRows({
            data: props.data,
            columns: props.columns,
            getRowId: props.getRowId,
            sorting,
            pagination,
            manualSorting: true,
            manualPagination: true,
            totalCount: props.totalCount,
          })
        : processRows({
            data: props.data,
            columns: props.columns,
            getRowId: props.getRowId,
            sorting,
            pagination,
            ...(props.manualSorting ? { manualSorting: true as const } : {}),
          });
  const displaySorting = processed ? processed.effectiveSorting : sorting;
  const state = props.loading
    ? "loading"
    : props.error
      ? "error"
      : props.data.length === 0
        ? "empty"
        : "success";

  function sortColumn(columnId: string) {
    const next = nextSortingState(sorting, columnId, props.columns);
    const change = withSortingChange(
      sorting,
      next,
      processed?.pagination ?? pagination,
    );
    if (change.sorting !== sorting) {
      setSorting(change.sorting);
      if (change.pagination !== (processed?.pagination ?? pagination))
        setPagination(change.pagination);
    }
  }

  function cellStyle(index: number): CSSProperties {
    const item = layout[index]!;
    return {
      width: item.width,
      minWidth: item.minWidth,
      left: item.pinnedLeft,
    };
  }

  function cellClass(index: number, header: boolean) {
    const item = layout[index]!;
    const pinned = item.pinnedLeft !== undefined;
    const boundary = pinned && item.boundary && scrolled;
    return `${pinned ? `sticky ${header ? "z-30" : "z-20"} bg-surface` : ""} ${boundary ? "data-table-pin-boundary" : ""}`;
  }

  return (
    <section
      aria-label="Data table"
      className="overflow-hidden rounded-lg border border-line bg-surface shadow-panel"
    >
      {state === "loading" ? (
        <p role="status" className="sr-only">
          Loading table data
        </p>
      ) : null}
      <div
        className="data-table-scroll max-w-full overflow-x-auto"
        onScroll={(event) => setScrolled(event.currentTarget.scrollLeft > 0)}
      >
        <table
          className="w-full table-fixed border-collapse text-left text-sm"
          style={{
            minWidth: layout.reduce((sum, item) => sum + item.width, 0),
          }}
        >
          <thead className="bg-surface-muted text-muted">
            <tr>
              {props.columns.map((column, index) => {
                const sortable = isSortableColumn(column);
                const direction =
                  displaySorting?.columnId === column.id
                    ? displaySorting.direction
                    : null;
                const Icon =
                  direction === "asc"
                    ? SortAscendingIcon
                    : direction === "desc"
                      ? SortDescendingIcon
                      : SortIcon;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      sortable
                        ? direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    style={{ ...cellStyle(index), textAlign: column.align }}
                    className={`border-b border-line px-4 py-3 font-semibold ${cellClass(index, true)} ${layout[index]?.pinnedLeft !== undefined ? "!bg-surface-muted" : ""}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => sortColumn(column.id)}
                        className={`inline-flex w-full items-center gap-2 rounded-sm text-inherit transition-colors hover:text-brand ${column.align === "right" ? "justify-end" : column.align === "center" ? "justify-center" : "justify-start"}`}
                      >
                        <span>{column.header}</span>
                        <Icon
                          aria-hidden="true"
                          className={`size-4 shrink-0 ${direction ? "text-brand" : "text-muted"}`}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {state === "loading"
              ? Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                    {props.columns.map((column, index) => (
                      <td
                        key={column.id}
                        style={cellStyle(index)}
                        className={`border-b border-line px-4 py-4 ${cellClass(index, false)}`}
                      >
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
            {state === "error" ? (
              <tr>
                <td colSpan={props.columns.length} className="p-4">
                  <ErrorState
                    title="Unable to load data"
                    description={props.error?.message || "Please try again."}
                  />
                </td>
              </tr>
            ) : null}
            {state === "empty" ? (
              <tr>
                <td colSpan={props.columns.length} className="p-4">
                  <EmptyState
                    title="No data available"
                    description="There are no rows to display."
                  />
                </td>
              </tr>
            ) : null}
            <DataTableRows
              key={`${props.expansion?.mode ?? "none"}:${typeof props.expansionResetKey}:${String(props.expansionResetKey)}`}
              rows={state === "success" ? (processed?.rows ?? []) : []}
              rowIds={state === "success" ? (processed?.rowIds ?? []) : []}
              columns={props.columns}
              expansion={props.expansion}
              cellStyle={cellStyle}
              cellClass={cellClass}
              pinnedAt={(index) => layout[index]?.pinnedLeft !== undefined}
            />
          </tbody>
        </table>
      </div>
      {processed ? (
        <DataTablePagination
          page={processed}
          pageSizeOptions={props.pageSizeOptions ?? DEFAULT_PAGE_SIZES}
          onChange={setPagination}
        />
      ) : null}
    </section>
  );
}
