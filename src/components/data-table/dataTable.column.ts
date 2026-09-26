import type { ColumnDef } from "./dataTable.type";

export function getColumnValue<TRow>(
  row: TRow,
  column: ColumnDef<TRow>,
): unknown {
  if (column.accessor) return column.accessor(row);
  if (column.accessorKey !== undefined) return row[column.accessorKey];
  return undefined;
}

export function isSortableColumn<TRow>(column: ColumnDef<TRow>): boolean {
  return (
    column.sortable === true &&
    (column.compare !== undefined ||
      column.accessor !== undefined ||
      column.accessorKey !== undefined)
  );
}

export function validateColumns<TRow>(
  columns: readonly ColumnDef<TRow>[],
): void {
  const ids = new Set<string>();
  for (const column of columns) {
    if (!column.id || ids.has(column.id)) {
      throw new Error(
        `DataTable column id must be unique and nonempty: ${column.id}`,
      );
    }
    ids.add(column.id);
    if (column.sortable && !isSortableColumn(column) && import.meta.env.DEV) {
      console.warn(
        `DataTable column "${column.id}" is sortable but has no comparison strategy`,
      );
    }
  }
}
