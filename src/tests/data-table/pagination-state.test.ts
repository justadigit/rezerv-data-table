import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getValidatedRowIds } from "@/components/data-table/dataTable.identity";
import { paginateClientRows } from "@/components/data-table/dataTable.pagination";
import { processRows } from "@/components/data-table/dataTable.process";
import {
  useControllableState,
  withPageSizeChange,
  withSortingChange,
} from "@/components/data-table/dataTable.state";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@/components/data-table";

const rows = [1, 2, 3, 4, 5].map((id) => ({ id }));

describe("pagination", () => {
  it("returns first, middle, and final partial pages with correct boundaries", () => {
    const first = paginateClientRows(rows, { pageIndex: 0, pageSize: 2 });
    const middle = paginateClientRows(rows, { pageIndex: 1, pageSize: 2 });
    const final = paginateClientRows(rows, { pageIndex: 2, pageSize: 2 });
    expect(first.rows.map((row) => row.id)).toEqual([1, 2]);
    expect(first).toMatchObject({
      pageCount: 3,
      start: 0,
      end: 2,
      hasPrevious: false,
      hasNext: true,
    });
    expect(middle.rows.map((row) => row.id)).toEqual([3, 4]);
    expect(middle).toMatchObject({
      start: 2,
      end: 4,
      hasPrevious: true,
      hasNext: true,
    });
    expect(final.rows.map((row) => row.id)).toEqual([5]);
    expect(final).toMatchObject({
      start: 4,
      end: 5,
      hasPrevious: true,
      hasNext: false,
    });
  });

  it("normalizes negative and excessive client indexes", () => {
    expect(
      paginateClientRows(rows, { pageIndex: -5, pageSize: 2 }).pagination
        .pageIndex,
    ).toBe(0);
    expect(
      paginateClientRows(rows, { pageIndex: 99, pageSize: 2 }).pagination
        .pageIndex,
    ).toBe(2);
  });

  it("uses index zero for an empty dataset", () => {
    expect(
      paginateClientRows([], { pageIndex: 8, pageSize: 10 }),
    ).toMatchObject({
      rows: [],
      pagination: { pageIndex: 0, pageSize: 10 },
      pageCount: 0,
      hasPrevious: false,
      hasNext: false,
      start: 0,
      end: 0,
    });
  });

  it("rejects invalid page size instead of producing undefined slices", () => {
    expect(() =>
      paginateClientRows(rows, { pageIndex: 0, pageSize: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      paginateClientRows(rows, { pageIndex: 0, pageSize: Number.NaN }),
    ).toThrow(RangeError);
    expect(() =>
      paginateClientRows(rows, { pageIndex: 0, pageSize: 1.5 }),
    ).toThrow(RangeError);
  });

  it("resets only on an actual sort or page-size change", () => {
    const pagination: PaginationState = { pageIndex: 2, pageSize: 10 };
    const current: SortingState = { columnId: "name", direction: "asc" };
    expect(
      withSortingChange(
        current,
        { columnId: "name", direction: "desc" },
        pagination,
      ).pagination.pageIndex,
    ).toBe(0);
    expect(withSortingChange(current, current, pagination).pagination).toBe(
      pagination,
    );
    expect(withPageSizeChange(pagination, 20)).toEqual({
      pageIndex: 0,
      pageSize: 20,
    });
    expect(withPageSizeChange(pagination, 10)).toBe(pagination);
  });
});

describe("manual processing", () => {
  it("preserves supplied page rows, controlled index, and total without double processing", () => {
    const supplied = [
      { id: 9, value: 90 },
      { id: 8, value: 80 },
    ];
    const column: ColumnDef<(typeof supplied)[number]> = {
      id: "value",
      header: "Value",
      accessorKey: "value",
      sortable: true,
    };
    const result = processRows({
      data: supplied,
      columns: [column],
      getRowId: (row) => row.id,
      sorting: { columnId: "value", direction: "asc" },
      pagination: { pageIndex: 4, pageSize: 2 },
      manualSorting: true,
      manualPagination: true,
      totalCount: 15,
    });
    expect(result.rows).toEqual(supplied);
    expect(result.pagination.pageIndex).toBe(4);
    expect(result.pageCount).toBe(8);
    expect(result.rowIds).toEqual([9, 8]);
  });

  it("does not normalize an out-of-range controlled index", () => {
    const result = processRows({
      data: [],
      columns: [{ id: "id", header: "ID", accessorKey: "id" }] as ColumnDef<{
        id: number;
      }>[],
      getRowId: (row) => row.id,
      sorting: null,
      pagination: { pageIndex: 99, pageSize: 10 },
      manualSorting: true,
      manualPagination: true,
      totalCount: 20,
    });
    expect(result.pagination.pageIndex).toBe(99);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });

  it("can paginate a full parent-sorted dataset without sorting it again", () => {
    const supplied = [{ id: 3 }, { id: 1 }, { id: 2 }];
    const result = processRows({
      data: supplied,
      columns: [{ id: "id", header: "ID", accessorKey: "id", sortable: true }],
      getRowId: (row) => row.id,
      sorting: { columnId: "id", direction: "asc" },
      pagination: { pageIndex: 0, pageSize: 2 },
      manualSorting: true,
    });
    expect(result.rowIds).toEqual([3, 1]);
    expect(result.pageCount).toBe(2);
  });
});

describe("state ownership", () => {
  it("updates uncontrolled state and notifies the callback", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 1, onChange }),
    );
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("emits controlled proposals without mirroring them, then accepts parent updates", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 0, onChange }),
      { initialProps: { value: 3 } },
    );
    act(() => result.current[1](4));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(result.current[0]).toBe(3);
    rerender({ value: 4 });
    expect(result.current[0]).toBe(4);
  });

  it("treats null sorting as a controlled value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<SortingState>({
        value: null,
        defaultValue: null,
        onChange,
      }),
    );
    act(() => result.current[1]({ columnId: "name", direction: "asc" }));
    expect(onChange).toHaveBeenCalledWith({
      columnId: "name",
      direction: "asc",
    });
    expect(result.current[0]).toBeNull();
  });
});

describe("row identity", () => {
  it("uses caller IDs, never array positions", () => {
    expect(
      getValidatedRowIds([{ code: "z" }, { code: "a" }], (row) => row.code),
    ).toEqual(["z", "a"]);
  });

  it("diagnoses duplicate and invalid IDs", () => {
    expect(() =>
      getValidatedRowIds(
        [{ code: "same" }, { code: "same" }],
        (row) => row.code,
      ),
    ).toThrow("duplicate row id");
    expect(() => getValidatedRowIds([{}], () => Number.NaN)).toThrow(
      "finite number or string",
    );
  });
});
