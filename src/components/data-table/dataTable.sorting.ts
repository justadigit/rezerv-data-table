import { getColumnValue, isSortableColumn } from "./dataTable.column";
import type { ColumnDef, SortingState } from "./dataTable.type";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

type SortValueKind = "number" | "string" | "date";

function valueKind(value: unknown): SortValueKind | null {
  if (typeof value === "number" && !Number.isNaN(value)) return "number";
  if (typeof value === "string") return "string";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return "date";
  return null;
}

function compareValues(
  left: unknown,
  right: unknown,
  kind: SortValueKind,
): number {
  if (kind === "number") {
    const leftNumber = left as number;
    const rightNumber = right as number;
    return leftNumber < rightNumber ? -1 : leftNumber > rightNumber ? 1 : 0;
  }
  if (kind === "string")
    return collator.compare(left as string, right as string);
  const leftTime = (left as Date).getTime();
  const rightTime = (right as Date).getTime();
  return leftTime < rightTime ? -1 : leftTime > rightTime ? 1 : 0;
}

export function effectiveSorting<TRow>(
  sorting: SortingState,
  columns: readonly ColumnDef<TRow>[],
): SortingState {
  if (!sorting) return null;
  const column = columns.find((item) => item.id === sorting.columnId);
  return column && isSortableColumn(column) ? sorting : null;
}

export function nextSortingState<TRow>(
  current: SortingState,
  columnId: string,
  columns: readonly ColumnDef<TRow>[],
): SortingState {
  const column = columns.find((item) => item.id === columnId);
  if (!column || !isSortableColumn(column)) return current;
  if (current?.columnId !== columnId) return { columnId, direction: "asc" };
  if (current.direction === "asc") return { columnId, direction: "desc" };
  return null;
}

export function sortClientRows<TRow>(
  rows: readonly TRow[],
  columns: readonly ColumnDef<TRow>[],
  sorting: SortingState,
): TRow[] {
  return sortClientRowsWithState(rows, columns, sorting).rows;
}

export function sortClientRowsWithState<TRow>(
  rows: readonly TRow[],
  columns: readonly ColumnDef<TRow>[],
  sorting: SortingState,
): { rows: TRow[]; effectiveSorting: SortingState } {
  const validSorting = effectiveSorting(sorting, columns);
  if (!validSorting) return { rows: rows.slice(), effectiveSorting: null };

  const column = columns.find((item) => item.id === validSorting.columnId);
  if (!column) return { rows: rows.slice(), effectiveSorting: null };

  const decorated = rows.map((row, order) => ({
    row,
    order,
    value: getColumnValue(row, column),
  }));

  let kind: SortValueKind | null = null;
  if (!column.compare) {
    for (const { value } of decorated) {
      if (value == null) continue;
      const currentKind = valueKind(value);
      if (!currentKind || (kind && currentKind !== kind)) {
        return { rows: rows.slice(), effectiveSorting: null };
      }
      kind = currentKind;
    }
  }

  decorated.sort((left, right) => {
    let compared: number;
    if (column.compare) {
      compared = column.compare(left.row, right.row);
      if (!Number.isFinite(compared)) compared = 0;
      compared *= validSorting.direction === "asc" ? 1 : -1;
    } else {
      const leftNullish = left.value == null;
      const rightNullish = right.value == null;
      if (leftNullish || rightNullish) {
        compared = leftNullish === rightNullish ? 0 : leftNullish ? 1 : -1;
      } else {
        compared = compareValues(left.value, right.value, kind!);
        if (validSorting.direction === "desc") compared *= -1;
      }
    }
    return compared || left.order - right.order;
  });
  return {
    rows: decorated.map(({ row }) => row),
    effectiveSorting: validSorting,
  };
}
