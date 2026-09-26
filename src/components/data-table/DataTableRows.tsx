import { Fragment, useId, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ExpandIcon } from "@/design";
import { getColumnValue } from "./dataTable.column";
import type { ColumnDef, ExpansionConfig, RowId } from "./dataTable.type";
import { useRowExpansion, type RowLoadState } from "./useRowExpansion";

type Props<TRow, TChild> = {
  rows: readonly TRow[];
  rowIds: readonly RowId[];
  columns: readonly ColumnDef<TRow>[];
  expansion: ExpansionConfig<TRow, TChild> | undefined;
  cellStyle: (index: number) => CSSProperties;
  cellClass: (index: number, header: boolean) => string;
  pinnedAt: (index: number) => boolean;
};

function defaultCell(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toLocaleDateString();
  return "—";
}

export function DataTableRows<TRow, TChild>({
  rows,
  rowIds,
  columns,
  expansion,
  cellStyle,
  cellClass,
  pinnedAt,
}: Props<TRow, TChild>) {
  const { expandedIds, loadStates, toggle, retry } = useRowExpansion(expansion);
  const instanceId = useId();

  function detailContent(
    row: TRow,
    rowId: RowId,
    loadState: RowLoadState<TChild> | undefined,
  ) {
    if (!expansion) return null;
    if (expansion.mode === "inline") {
      const children = expansion.getChildren(row);
      return children.length ? (
        expansion.renderChildren(children, row, { row, rowId, children })
      ) : (
        <EmptyState
          title="No details available"
          description="This row has no details to display."
        />
      );
    }
    if (!loadState || loadState.status === "loading") {
      return (
        <p role="status" className="text-sm text-muted">
          Loading details
        </p>
      );
    }
    if (loadState.status === "error") {
      return (
        <ErrorState
          title="Unable to load details"
          description={loadState.error.message || "Please try again."}
          action={
            <Button variant="secondary" onClick={() => retry(row, rowId)}>
              Retry loading details
            </Button>
          }
        />
      );
    }
    return loadState.children.length ? (
      expansion.renderChildren(loadState.children, row, {
        row,
        rowId,
        children: loadState.children,
      })
    ) : (
      <EmptyState
        title="No details available"
        description="This row has no details to display."
      />
    );
  }

  return rows.map((row, index) => {
    const rowId = rowIds[index]!;
    const expanded = expandedIds.has(rowId) && expansion !== undefined;
    const detailId = `${instanceId}-detail-${encodeURIComponent(`${typeof rowId}:${rowId}`)}`;
    return (
      <Fragment key={`${typeof rowId}:${rowId}`}>
        <tr className="group hover:bg-surface-muted">
          {columns.map((column, columnIndex) => {
            const value = getColumnValue(row, column);
            const content = column.cell
              ? column.cell({ row, rowId, value })
              : defaultCell(value);
            return (
              <td
                key={column.id}
                style={{ ...cellStyle(columnIndex), textAlign: column.align }}
                className={`border-b border-line px-4 py-3 text-ink ${cellClass(columnIndex, false)} ${pinnedAt(columnIndex) ? "group-hover:bg-surface-muted" : ""}`}
              >
                {columnIndex === 0 && expansion ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={expanded ? "Collapse row" : "Expand row"}
                      aria-expanded={expanded}
                      aria-controls={expanded ? detailId : undefined}
                      onClick={() => toggle(row, rowId)}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      <ExpandIcon
                        aria-hidden="true"
                        className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                      />
                    </button>
                    <div className="min-w-0 flex-1">{content}</div>
                  </div>
                ) : (
                  content
                )}
              </td>
            );
          })}
        </tr>
        {expanded ? (
          <tr className="bg-surface-muted">
            <td
              colSpan={columns.length}
              className="border-b border-line p-4 sm:p-5"
            >
              <div
                id={detailId}
                className="data-table-detail-content data-table-detail-enter"
              >
                {detailContent(row, rowId, loadStates.get(rowId))}
              </div>
            </td>
          </tr>
        ) : null}
      </Fragment>
    );
  });
}
