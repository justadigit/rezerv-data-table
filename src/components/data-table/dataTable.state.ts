import { useState } from "react";
import { assertPageSize } from "./dataTable.pagination";
import type { PaginationState, SortingState } from "./dataTable.type";

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): readonly [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  function propose(next: T) {
    if (!controlled) setInternal(next);
    onChange?.(next);
  }

  return [current, propose] as const;
}

export function withSortingChange(
  currentSorting: SortingState,
  nextSorting: SortingState,
  pagination: PaginationState,
): { sorting: SortingState; pagination: PaginationState } {
  const changed =
    currentSorting?.columnId !== nextSorting?.columnId ||
    currentSorting?.direction !== nextSorting?.direction;
  return {
    sorting: changed ? nextSorting : currentSorting,
    pagination: changed ? { ...pagination, pageIndex: 0 } : pagination,
  };
}

export function withPageSizeChange(
  pagination: PaginationState,
  pageSize: number,
): PaginationState {
  assertPageSize(pageSize);
  return pagination.pageSize === pageSize
    ? pagination
    : { pageIndex: 0, pageSize };
}
