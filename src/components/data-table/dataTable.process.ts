import { validateColumns } from "./dataTable.column";
import { getValidatedRowIds } from "./dataTable.identity";
import {
  describeManualPage,
  paginateClientRows,
  type PageResult,
} from "./dataTable.pagination";
import { sortClientRowsWithState } from "./dataTable.sorting";
import type {
  ColumnDef,
  PaginationState,
  RowId,
  SortingState,
} from "./dataTable.type";

type ClientMode = {
  manualSorting?: boolean;
  manualPagination?: false;
  totalCount?: never;
};
type ManualMode = {
  manualSorting: true;
  manualPagination: true;
  totalCount: number;
};

export type ProcessingInput<TRow> = {
  data: readonly TRow[];
  columns: readonly ColumnDef<TRow>[];
  getRowId: (row: TRow) => RowId;
  sorting: SortingState;
  pagination: PaginationState;
} & (ClientMode | ManualMode);

export type ProcessingResult<TRow> = PageResult<TRow> & {
  effectiveSorting: SortingState;
  rowIds: RowId[];
};

export function processRows<TRow>(
  input: ProcessingInput<TRow>,
): ProcessingResult<TRow> {
  validateColumns(input.columns);
  getValidatedRowIds(input.data, input.getRowId);
  const sorted = input.manualSorting
    ? { rows: input.data.slice(), effectiveSorting: input.sorting }
    : sortClientRowsWithState(input.data, input.columns, input.sorting);
  const page = input.manualPagination
    ? describeManualPage(sorted.rows, input.pagination, input.totalCount)
    : paginateClientRows(sorted.rows, input.pagination);

  return {
    ...page,
    effectiveSorting: sorted.effectiveSorting,
    rowIds: page.rows.map(input.getRowId),
  };
}
