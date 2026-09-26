import type { ReactNode } from "react";

export type RowId = string | number;
export type SortDirection = "asc" | "desc";
export type SortingState = {
  columnId: string;
  direction: SortDirection;
} | null;
export type PaginationState = { pageIndex: number; pageSize: number };

export type CellContext<TRow> = {
  row: TRow;
  rowId: RowId;
  value: unknown;
};

export type ColumnDef<TRow> = {
  id: string;
  header: ReactNode;
  accessorKey?: keyof TRow;
  accessor?: (row: TRow) => unknown;
  cell?: (context: CellContext<TRow>) => ReactNode;
  sortable?: boolean;
  compare?: (left: TRow, right: TRow) => number;
  width?: number;
  minWidth?: number;
  pinned?: "left";
  align?: "left" | "center" | "right";
};

export type ExpansionConfig<TRow, TChild> =
  | {
      mode: "inline";
      getChildren: (row: TRow) => readonly TChild[];
      renderChildren: (children: readonly TChild[], row: TRow) => ReactNode;
    }
  | {
      mode: "on-demand";
      loadChildren: (
        row: TRow,
        signal: AbortSignal,
      ) => Promise<readonly TChild[]>;
      renderChildren: (children: readonly TChild[], row: TRow) => ReactNode;
    };

type ControlledSorting = {
  sorting: SortingState;
  onSortingChange: (next: SortingState) => void;
  defaultSorting?: never;
};

type UncontrolledSorting = {
  sorting?: never;
  defaultSorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;
};

type ControlledPagination = {
  pagination: PaginationState;
  onPaginationChange: (next: PaginationState) => void;
  defaultPagination?: never;
};

type UncontrolledPagination = {
  pagination?: never;
  defaultPagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;
};

type StateMode =
  | ({ manualSorting?: false; manualPagination?: false; totalCount?: never } & (
      ControlledSorting | UncontrolledSorting
    ) &
      (ControlledPagination | UncontrolledPagination))
  | ({
      manualSorting: true;
      manualPagination?: false;
      totalCount?: never;
    } & ControlledSorting &
      (ControlledPagination | UncontrolledPagination))
  | ({
      manualSorting: true;
      manualPagination: true;
      totalCount: number;
    } & ControlledSorting &
      ControlledPagination);

export type DataTableProps<TRow, TChild = never> = {
  data: readonly TRow[];
  columns: readonly ColumnDef<TRow>[];
  getRowId: (row: TRow) => RowId;
  pageSizeOptions?: readonly number[];
  loading?: boolean;
  error?: Error | null;
  expansion?: ExpansionConfig<TRow, TChild>;
} & StateMode;
