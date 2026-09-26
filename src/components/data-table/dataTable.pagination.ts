import type { PaginationState } from "./dataTable.type";

export const defaultPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

export function assertPageSize(pageSize: number): void {
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
    throw new RangeError(
      "DataTable pageSize must be a positive finite integer",
    );
  }
}

export function pageCountFor(totalCount: number, pageSize: number): number {
  assertPageSize(pageSize);
  if (!Number.isSafeInteger(totalCount) || totalCount < 0) {
    throw new RangeError(
      "DataTable totalCount must be a nonnegative finite integer",
    );
  }
  return Math.ceil(totalCount / pageSize);
}

export function normalizePageIndex(
  pageIndex: number,
  pageCount: number,
): number {
  if (!Number.isFinite(pageIndex)) return 0;
  return Math.min(
    Math.max(Math.trunc(pageIndex), 0),
    Math.max(pageCount - 1, 0),
  );
}

export type PageResult<TRow> = {
  rows: TRow[];
  pagination: PaginationState;
  totalCount: number;
  pageCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  start: number;
  end: number;
};

export function paginateClientRows<TRow>(
  rows: readonly TRow[],
  pagination: PaginationState,
): PageResult<TRow> {
  const totalCount = rows.length;
  const pageCount = pageCountFor(totalCount, pagination.pageSize);
  const pageIndex = normalizePageIndex(pagination.pageIndex, pageCount);
  const start = pageIndex * pagination.pageSize;
  const end = Math.min(start + pagination.pageSize, totalCount);
  return {
    rows: rows.slice(start, end),
    pagination: { pageIndex, pageSize: pagination.pageSize },
    totalCount,
    pageCount,
    hasPrevious: pageIndex > 0,
    hasNext: pageIndex < pageCount - 1,
    start,
    end,
  };
}

export function describeManualPage<TRow>(
  rows: readonly TRow[],
  pagination: PaginationState,
  totalCount: number,
): PageResult<TRow> {
  const pageCount = pageCountFor(totalCount, pagination.pageSize);
  const start = pagination.pageIndex * pagination.pageSize;
  return {
    rows: rows.slice(),
    pagination,
    totalCount,
    pageCount,
    hasPrevious: pagination.pageIndex > 0,
    hasNext: pagination.pageIndex < pageCount - 1,
    start,
    end: start + rows.length,
  };
}
