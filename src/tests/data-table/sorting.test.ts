import { describe, expect, it, vi } from "vitest";
import {
  getColumnValue,
  isSortableColumn,
  validateColumns,
} from "@/components/data-table/dataTable.column";
import { processRows } from "@/components/data-table/dataTable.process";
import {
  nextSortingState,
  sortClientRows,
} from "@/components/data-table/dataTable.sorting";
import type {
  ColumnDef,
  DataTableProps,
  SortingState,
} from "@/components/data-table";

type PersonRow = {
  id: string;
  name: string;
  age: number;
  joined: Date;
  nickname?: string | null;
};
type OrderRow = { orderNumber: number; total: number; createdAt: Date };

const people: PersonRow[] = [
  {
    id: "a",
    name: "Item 10",
    age: 30,
    joined: new Date("2024-03-01"),
    nickname: null,
  },
  {
    id: "b",
    name: "item 2",
    age: 20,
    joined: new Date("2024-01-01"),
    nickname: "Bee",
  },
  { id: "c", name: "ITEM 2", age: 20, joined: new Date("2024-02-01") },
];

const nameColumn: ColumnDef<PersonRow> = {
  id: "display-name",
  header: "Name",
  accessorKey: "name",
  sortable: true,
};
const ageColumn: ColumnDef<PersonRow> = {
  id: "age",
  header: "Age",
  accessorKey: "age",
  sortable: true,
};
const joinedColumn: ColumnDef<PersonRow> = {
  id: "joined",
  header: "Joined",
  accessorKey: "joined",
  sortable: true,
};

describe("column values and capability", () => {
  it("resolves direct and derived values, preferring an explicit accessor", () => {
    expect(getColumnValue(people[0]!, nameColumn)).toBe("Item 10");
    const derived: ColumnDef<PersonRow> = {
      id: "age-label",
      header: "Age label",
      accessorKey: "age",
      accessor: (row) => `${row.age} years`,
      sortable: true,
    };
    expect(getColumnValue(people[0]!, derived)).toBe("30 years");
    expect(
      getColumnValue(people[0]!, { id: "visual", header: "Visual" }),
    ).toBeUndefined();
    expect(isSortableColumn(derived)).toBe(true);
  });

  it("rejects visual-only sorting and diagnoses missing strategies in development", () => {
    const invalid: ColumnDef<PersonRow> = {
      id: "visual",
      header: "Visual",
      cell: () => "Rendered only",
      sortable: true,
    };
    expect(isSortableColumn(invalid)).toBe(false);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      validateColumns([invalid]);
      expect(warning).toHaveBeenCalledWith(expect.stringContaining("visual"));
    } finally {
      warning.mockRestore();
    }
  });

  it("accepts a second row shape and a derived id unrelated to row properties", () => {
    const orders: OrderRow[] = [
      { orderNumber: 8, total: 50, createdAt: new Date("2024-01-01") },
      { orderNumber: 4, total: 10, createdAt: new Date("2024-02-01") },
    ];
    const columns: ColumnDef<OrderRow>[] = [
      {
        id: "summary",
        header: "Summary",
        accessor: (row) => `${row.orderNumber}: ${row.total}`,
      },
      { id: "total", header: "Total", accessorKey: "total", sortable: true },
    ];
    const result = processRows({
      data: orders,
      columns,
      getRowId: (row) => row.orderNumber,
      sorting: { columnId: "total", direction: "asc" },
      pagination: { pageIndex: 0, pageSize: 10 },
    });
    expect(result.rowIds).toEqual([4, 8]);
    expect(getColumnValue(orders[0]!, columns[0]!)).toBe("8: 50");
    const manualProps = {
      data: orders,
      columns,
      getRowId: (row: OrderRow) => row.orderNumber,
      manualSorting: true,
      manualPagination: true,
      totalCount: 20,
      sorting: null,
      onSortingChange: () => {},
      pagination: { pageIndex: 0, pageSize: 10 },
      onPaginationChange: () => {},
    } satisfies DataTableProps<OrderRow>;
    expect(manualProps.totalCount).toBe(20);
  });
});

describe("sorting transitions", () => {
  const columns = [
    nameColumn,
    ageColumn,
    { id: "visual", header: "Visual" },
  ] as const;

  it("cycles none, asc, desc, none and starts a new column at asc", () => {
    const asc = nextSortingState(null, "display-name", columns);
    const desc = nextSortingState(asc, "display-name", columns);
    expect(asc).toEqual({ columnId: "display-name", direction: "asc" });
    expect(desc).toEqual({ columnId: "display-name", direction: "desc" });
    expect(nextSortingState(desc, "display-name", columns)).toBeNull();
    expect(nextSortingState(desc, "age", columns)).toEqual({
      columnId: "age",
      direction: "asc",
    });
  });

  it("ignores unknown and non-sortable columns", () => {
    const current: SortingState = { columnId: "age", direction: "desc" };
    expect(nextSortingState(current, "missing", columns)).toBe(current);
    expect(nextSortingState(current, "visual", columns)).toBe(current);
  });
});

describe("client sorting", () => {
  it("sorts numbers without mutating input and preserves equal-value order", () => {
    const original = people.slice();
    expect(
      sortClientRows(people, [ageColumn], {
        columnId: "age",
        direction: "asc",
      }).map((row) => row.id),
    ).toEqual(["b", "c", "a"]);
    expect(
      sortClientRows(people, [ageColumn], {
        columnId: "age",
        direction: "desc",
      }).map((row) => row.id),
    ).toEqual(["a", "b", "c"]);
    expect(people).toEqual(original);
  });

  it("sorts strings naturally and case-insensitively", () => {
    expect(
      sortClientRows(people, [nameColumn], {
        columnId: "display-name",
        direction: "asc",
      }).map((row) => row.id),
    ).toEqual(["b", "c", "a"]);
  });

  it("sorts Date instances by timestamp", () => {
    expect(
      sortClientRows(people, [joinedColumn], {
        columnId: "joined",
        direction: "asc",
      }).map((row) => row.id),
    ).toEqual(["b", "c", "a"]);
  });

  it("places null and undefined last in either direction", () => {
    const column: ColumnDef<PersonRow> = {
      id: "nickname",
      header: "Nickname",
      accessorKey: "nickname",
      sortable: true,
    };
    expect(
      sortClientRows(people, [column], {
        columnId: "nickname",
        direction: "asc",
      }).map((row) => row.id),
    ).toEqual(["b", "a", "c"]);
    expect(
      sortClientRows(people, [column], {
        columnId: "nickname",
        direction: "desc",
      }).map((row) => row.id),
    ).toEqual(["b", "a", "c"]);
  });

  it("prefers a custom row comparator over accessor values", () => {
    const column: ColumnDef<PersonRow> = {
      id: "custom",
      header: "Custom",
      accessor: (row) => row.age,
      sortable: true,
      compare: (left, right) => right.age - left.age,
    };
    expect(
      sortClientRows(people, [column], {
        columnId: "custom",
        direction: "asc",
      }).map((row) => row.id),
    ).toEqual(["a", "b", "c"]);
    expect(
      isSortableColumn({
        id: "compare-only",
        header: "Compare",
        sortable: true,
        compare: (left: PersonRow, right: PersonRow) => right.age - left.age,
      }),
    ).toBe(true);
  });

  it("keeps source order for invalid or unsupported sorting", () => {
    expect(
      sortClientRows(people, [ageColumn], {
        columnId: "missing",
        direction: "asc",
      }),
    ).toEqual(people);
    expect(
      sortClientRows(people, [{ id: "visual", header: "Visual" }], {
        columnId: "visual",
        direction: "asc",
      }),
    ).toEqual(people);
    const complex: ColumnDef<PersonRow> = {
      id: "complex",
      header: "Complex",
      accessor: (row) => ({ age: row.age }),
      sortable: true,
    };
    expect(
      sortClientRows(people, [complex], {
        columnId: "complex",
        direction: "asc",
      }),
    ).toEqual(people);
    expect(
      processRows({
        data: people,
        columns: [complex],
        getRowId: (row) => row.id,
        sorting: { columnId: "complex", direction: "asc" },
        pagination: { pageIndex: 0, pageSize: 10 },
      }).effectiveSorting,
    ).toBeNull();
    expect(
      processRows({
        data: people,
        columns: [ageColumn],
        getRowId: (row) => row.id,
        sorting: { columnId: "missing", direction: "asc" },
        pagination: { pageIndex: 0, pageSize: 10 },
      }).effectiveSorting,
    ).toBeNull();
  });

  it("sorts the full dataset before taking the first page", () => {
    const rows = [3, 1, 4, 2].map((value) => ({ value }));
    const column: ColumnDef<(typeof rows)[number]> = {
      id: "value",
      header: "Value",
      accessorKey: "value",
      sortable: true,
    };
    const result = processRows({
      data: rows,
      columns: [column],
      getRowId: (row) => row.value,
      sorting: { columnId: "value", direction: "asc" },
      pagination: { pageIndex: 0, pageSize: 2 },
    });
    expect(result.rows.map((row) => row.value)).toEqual([1, 2]);
    expect(result.rowIds).toEqual([1, 2]);
    expect(rows.map((row) => row.value)).toEqual([3, 1, 4, 2]);
  });
});
