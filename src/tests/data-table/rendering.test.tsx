import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type ColumnDef } from "@/components/data-table";

type Row = {
  id: string;
  name: string;
  amount: number;
  nested: { label: string };
};
const data: Row[] = [
  { id: "c", name: "Charlie", amount: 3, nested: { label: "Third" } },
  { id: "a", name: "Alpha", amount: 1, nested: { label: "First" } },
  { id: "b", name: "Bravo", amount: 2, nested: { label: "Second" } },
];
const columns: ColumnDef<Row>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    width: 120,
    pinned: "left",
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    sortable: true,
    width: 100,
    pinned: "left",
    align: "right",
  },
  {
    id: "derived",
    header: "Derived",
    accessor: (row) => row.nested.label,
    width: 140,
  },
  {
    id: "custom",
    header: "Custom",
    accessorKey: "amount",
    cell: ({ value, rowId }) => `${rowId}: ${value}`,
    width: 120,
  },
  { id: "object", header: "Object", accessorKey: "nested", width: 120 },
];
const props = { data, columns, getRowId: (row: Row) => row.id };
const bodyRows = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("DataTable rendering", () => {
  it("renders semantic rows, canonical values, custom cells, safe fallback, and alignment", () => {
    render(<DataTable {...props} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByText("Third")).toBeInTheDocument();
    expect(screen.getByText("c: 3")).toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveStyle({
      textAlign: "right",
    });
    expect(screen.getByRole("cell", { name: "3" })).toHaveStyle({
      textAlign: "right",
    });
    expect(
      screen.getAllByRole("button", { name: /name|amount/i }),
    ).toHaveLength(2);
    expect(
      screen
        .getByRole("columnheader", { name: "Derived" })
        .querySelector("button"),
    ).toBeNull();
  });

  it("cycles sorting and starts a different column ascending", async () => {
    const user = userEvent.setup();
    render(<DataTable {...props} />);
    const name = screen.getByRole("button", { name: "Name" });
    const amount = screen.getByRole("button", { name: "Amount" });
    const header = screen.getByRole("columnheader", { name: "Name" });
    expect(header).toHaveAttribute("aria-sort", "none");
    await user.click(name);
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(bodyRows()[0]).toHaveTextContent("Alpha");
    await user.click(name);
    expect(header).toHaveAttribute("aria-sort", "descending");
    await user.click(name);
    expect(header).toHaveAttribute("aria-sort", "none");
    await user.click(amount);
    expect(
      screen.getByRole("columnheader", { name: "Amount" }),
    ).toHaveAttribute("aria-sort", "ascending");
  });

  it("keeps controlled sort appearance until parent accepts the proposal", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    const { rerender } = render(
      <DataTable {...props} sorting={null} onSortingChange={onSortingChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSortingChange).toHaveBeenCalledWith({
      columnId: "name",
      direction: "asc",
    });
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "none",
    );
    rerender(
      <DataTable
        {...props}
        sorting={{ columnId: "name", direction: "asc" }}
        onSortingChange={onSortingChange}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("does not announce a sort that the client pipeline could not apply", () => {
    render(
      <DataTable
        {...props}
        columns={[
          {
            id: "nested",
            header: "Nested",
            accessorKey: "nested",
            sortable: true,
          },
        ]}
        sorting={{ columnId: "nested", direction: "asc" }}
        onSortingChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: "Nested" }),
    ).toHaveAttribute("aria-sort", "none");
  });

  it("uses loading, error, empty, success precedence with table structure", () => {
    const { rerender } = render(
      <DataTable {...props} loading error={new Error("failure")} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading table data");
    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(
      4,
    );
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
    rerender(<DataTable {...props} data={[]} error={new Error("failure")} />);
    expect(screen.getByRole("alert")).toHaveTextContent("failure");
    expect(screen.queryByText("No data available")).not.toBeInTheDocument();
    rerender(<DataTable {...props} data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(
      1,
    );
  });

  it("paginates, changes page size, and resets to first page on sort", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        {...props}
        defaultPagination={{ pageIndex: 0, pageSize: 1 }}
        pageSizeOptions={[1, 2]}
      />,
    );
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Rows per page" }),
      "2",
    );
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("preserves controlled manual page and emits proposals without slicing rows", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    const onSortingChange = vi.fn();
    render(
      <DataTable
        {...props}
        sorting={null}
        onSortingChange={onSortingChange}
        pagination={{ pageIndex: 2, pageSize: 2 }}
        onPaginationChange={onPaginationChange}
        manualSorting
        manualPagination
        totalCount={10}
        pageSizeOptions={[2, 5]}
      />,
    );
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByText("Page 3 of 5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 3,
      pageSize: 2,
    });
    expect(screen.getByText("Page 3 of 5")).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Rows per page" }),
      "5",
    );
    expect(onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 5,
    });
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSortingChange).toHaveBeenCalledWith({
      columnId: "name",
      direction: "asc",
    });
    expect(onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 2,
    });
  });

  it("supports native keyboard activation and pinned offsets", async () => {
    const user = userEvent.setup();
    render(<DataTable {...props} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Name" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Amount" })).toHaveFocus();
    await user.keyboard(" ");
    expect(
      screen.getByRole("columnheader", { name: "Amount" }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveStyle({
      left: "0px",
    });
    expect(screen.getByRole("columnheader", { name: "Amount" })).toHaveStyle({
      left: "120px",
    });
    expect(screen.getByRole("cell", { name: "3" })).toHaveStyle({
      left: "120px",
    });
  });

  it("diagnoses missing pinned width and empty columns", () => {
    expect(() =>
      render(
        <DataTable
          {...props}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", pinned: "left" },
          ]}
        />,
      ),
    ).toThrow(/explicit width/);
    expect(() => render(<DataTable {...props} columns={[]} />)).toThrow(
      /at least one column/,
    );
  });
});
