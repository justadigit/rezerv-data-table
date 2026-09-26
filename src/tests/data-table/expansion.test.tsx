import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DataTable,
  type ColumnDef,
  type ExpansionConfig,
  type ExpansionEmptyContext,
} from "@/components/data-table";

type Row = { id: string; name: string; children: string[] };
const rows: Row[] = [
  { id: "b", name: "Beta", children: ["Beta detail"] },
  { id: "a", name: "Alpha", children: [] },
];
const columns: ColumnDef<Row>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    pinned: "left",
    width: 140,
  },
  { id: "id", header: "ID", accessorKey: "id", width: 120 },
];
const base = { data: rows, columns, getRowId: (row: Row) => row.id };
const renderChildren: ExpansionConfig<Row, string>["renderChildren"] = (
  children,
) => <div>{children.join(", ")}</div>;
const inline: ExpansionConfig<Row, string> = {
  mode: "inline",
  getChildren: (row) => row.children,
  renderChildren,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function rowFor(name: string) {
  return screen.getByText(name).closest("tr")!;
}

function toggleFor(name: string) {
  return within(rowFor(name)).getByRole("button", {
    name: /expand row|collapse row/i,
  });
}

describe("DataTable expansion", () => {
  it("renders inline detail below its parent with stable ARIA, full colspan, and empty content", async () => {
    const user = userEvent.setup();
    const renderInline = vi.fn(renderChildren);
    render(
      <DataTable
        {...base}
        expansion={{ ...inline, renderChildren: renderInline }}
      />,
    );
    const beta = toggleFor("Beta");
    expect(beta).toHaveAttribute("aria-expanded", "false");
    expect(beta).not.toHaveAttribute("aria-controls");
    await user.click(beta);
    expect(beta).toHaveAttribute("aria-expanded", "true");
    const detailId = beta.getAttribute("aria-controls")!;
    expect(document.getElementById(detailId)).toHaveTextContent("Beta detail");
    expect(
      rowFor("Beta").nextElementSibling?.querySelector("td"),
    ).toHaveAttribute("colspan", "2");
    expect(renderInline).toHaveBeenCalledWith(["Beta detail"], rows[0], {
      row: rows[0],
      rowId: "b",
      children: ["Beta detail"],
    });
    await user.click(beta);
    expect(beta).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(detailId)).toBeNull();
    await user.click(beta);
    expect(beta.getAttribute("aria-controls")).toBe(detailId);
    await user.click(toggleFor("Alpha"));
    expect(screen.getByText("No details available")).toBeInTheDocument();
    expect(rowFor("Alpha")).toBeInTheDocument();
  });

  it("uses a typed custom empty renderer for inline children", async () => {
    const user = userEvent.setup();
    const renderEmpty = vi.fn(({ row, rowId }: ExpansionEmptyContext<Row>) => (
      <p>{`${row.name} has no children (${rowId})`}</p>
    ));
    render(<DataTable {...base} expansion={{ ...inline, renderEmpty }} />);
    const toggle = toggleFor("Alpha");
    await user.click(toggle);
    expect(renderEmpty).toHaveBeenCalledWith({ row: rows[1], rowId: "a" });
    expect(screen.getByText("Alpha has no children (a)")).toBeInTheDocument();
    expect(screen.queryByText("No details available")).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(toggle.getAttribute("aria-controls")!),
    ).toHaveTextContent("Alpha has no children (a)");
    expect(
      rowFor("Alpha").nextElementSibling?.querySelector("td"),
    ).toHaveAttribute("colspan", "2");
  });

  it("keeps expansion with RowId through sorting and parent-only pagination", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        {...base}
        expansion={inline}
        defaultPagination={{ pageIndex: 0, pageSize: 1 }}
      />,
    );
    await user.click(toggleFor("Beta"));
    expect(screen.getByText("Beta detail")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.queryByText("Beta detail")).not.toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Beta detail")).toBeInTheDocument();
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("table").querySelectorAll("tbody tr")).toHaveLength(
      2,
    );
  });

  it("uses native keyboard activation and keeps the expander in the pinned first cell", async () => {
    const user = userEvent.setup();
    render(<DataTable {...base} expansion={inline} />);
    const button = toggleFor("Beta");
    expect(button.closest("td")).toHaveStyle({ left: "0px" });
    await user.tab(); // sort header
    await user.tab(); // first row expander
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("loads only the selected row, passes its AbortSignal, and caches success", async () => {
    const user = userEvent.setup();
    const first = deferred<readonly string[]>();
    const loadChildren = vi.fn(() => first.promise);
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    await user.click(toggleFor("Beta"));
    expect(
      within(rowFor("Beta").nextElementSibling as HTMLElement).getByRole(
        "status",
      ),
    ).toHaveTextContent("Loading details");
    expect(rowFor("Alpha").nextElementSibling).toBeNull();
    expect(loadChildren).toHaveBeenCalledWith(rows[0], expect.any(AbortSignal));
    await act(async () => first.resolve(["Loaded Beta"]));
    expect(screen.getByText("Loaded Beta")).toBeInTheDocument();
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Beta"));
    expect(screen.getByText("Loaded Beta")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("caches an empty success and presents a generic empty state", async () => {
    const user = userEvent.setup();
    const loadChildren = vi.fn(async () => [] as string[]);
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    await user.click(toggleFor("Alpha"));
    expect(await screen.findByText("No details available")).toBeInTheDocument();
    await user.click(toggleFor("Alpha"));
    await user.click(toggleFor("Alpha"));
    expect(screen.getByText("No details available")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("uses a custom empty renderer for cached on-demand success without retry", async () => {
    const user = userEvent.setup();
    const loadChildren = vi.fn(async () => [] as string[]);
    const renderEmpty = vi.fn(({ row }: { row: Row }) => (
      <p>No children for {row.name}</p>
    ));
    render(
      <DataTable
        {...base}
        expansion={{
          mode: "on-demand",
          loadChildren,
          renderChildren,
          renderEmpty,
        }}
      />,
    );
    await user.click(toggleFor("Alpha"));
    expect(
      await screen.findByText("No children for Alpha"),
    ).toBeInTheDocument();
    expect(screen.queryByText("No details available")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry loading details" }),
    ).not.toBeInTheDocument();
    await user.click(toggleFor("Alpha"));
    await user.click(toggleFor("Alpha"));
    expect(screen.getByText("No children for Alpha")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(renderEmpty).toHaveBeenCalledWith({ row: rows[1], rowId: "a" });
  });

  it("refetches a successful row on re-expansion when caching is disabled", async () => {
    const user = userEvent.setup();
    const loadChildren = vi
      .fn()
      .mockResolvedValueOnce(["First result"])
      .mockResolvedValueOnce(["Second result"]);
    render(
      <DataTable
        {...base}
        expansion={{
          mode: "on-demand",
          cache: false,
          loadChildren,
          renderChildren,
        }}
      />,
    );
    await user.click(toggleFor("Beta"));
    expect(await screen.findByText("First result")).toBeInTheDocument();
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Beta"));
    expect(await screen.findByText("Second result")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("shows row-local error and retries into success", async () => {
    const user = userEvent.setup();
    const loadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error("Preview failed"))
      .mockResolvedValueOnce(["Recovered"]);
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    await user.click(toggleFor("Beta"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Preview failed",
    );
    expect(rowFor("Alpha").nextElementSibling).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Retry loading details" }),
    );
    expect(await screen.findByText("Recovered")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("supports concurrent independent row outcomes", async () => {
    const user = userEvent.setup();
    const beta = deferred<readonly string[]>();
    const alpha = deferred<readonly string[]>();
    const loadChildren = vi.fn((row: Row) =>
      row.id === "b" ? beta.promise : alpha.promise,
    );
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Alpha"));
    expect(screen.getAllByRole("status")).toHaveLength(2);
    await act(async () => beta.resolve(["Beta loaded"]));
    expect(screen.getByText("Beta loaded")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading details");
    await act(async () => alpha.reject(new Error("Alpha failed")));
    expect(screen.getByRole("alert")).toHaveTextContent("Alpha failed");
    expect(screen.getByText("Beta loaded")).toBeInTheDocument();
  });

  it("may cache completion while collapsed without reopening", async () => {
    const user = userEvent.setup();
    const pending = deferred<readonly string[]>();
    const loadChildren = vi.fn((row: Row, signal: AbortSignal) => {
      expect(row.id).toBe("b");
      expect(signal).toBeInstanceOf(AbortSignal);
      return pending.promise;
    });
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Beta"));
    await act(async () => pending.resolve(["Cached while closed"]));
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Cached while closed")).not.toBeInTheDocument();
    await user.click(toggleFor("Beta"));
    expect(screen.getByText("Cached while closed")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("rejects older success after a newer cache-disabled request", async () => {
    const user = userEvent.setup();
    const old = deferred<readonly string[]>();
    const next = deferred<readonly string[]>();
    const loadChildren = vi
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(next.promise);
    render(
      <DataTable
        {...base}
        expansion={{
          mode: "on-demand",
          cache: false,
          loadChildren,
          renderChildren,
        }}
      />,
    );
    await user.click(toggleFor("Beta"));
    const oldSignal = loadChildren.mock.calls[0]![1] as AbortSignal;
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Beta"));
    expect(loadChildren).toHaveBeenCalledTimes(2);
    expect(oldSignal.aborted).toBe(true);
    await act(async () => next.resolve(["New result"]));
    await act(async () => old.resolve(["Old result"]));
    expect(screen.getByText("New result")).toBeInTheDocument();
    expect(screen.queryByText("Old result")).not.toBeInTheDocument();
  });

  it("ignores an older rejection after a newer success", async () => {
    const user = userEvent.setup();
    const old = deferred<readonly string[]>();
    const next = deferred<readonly string[]>();
    const loadChildren = vi
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(next.promise);
    render(
      <DataTable
        {...base}
        expansion={{
          mode: "on-demand",
          cache: false,
          loadChildren,
          renderChildren,
        }}
      />,
    );
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Beta"));
    await user.click(toggleFor("Beta"));
    await act(async () => next.resolve(["Current result"]));
    await act(async () => old.reject(new Error("Stale failure")));
    expect(screen.getByText("Current result")).toBeInTheDocument();
    expect(screen.queryByText("Stale failure")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("aborts and ignores old-dataset completion after reset, without changing pagination", async () => {
    const user = userEvent.setup();
    const old = deferred<readonly string[]>();
    const next = deferred<readonly string[]>();
    const loadChildren = vi
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(next.promise);
    const expansion: ExpansionConfig<Row, string> = {
      mode: "on-demand",
      loadChildren,
      renderChildren,
    };
    const { rerender } = render(
      <DataTable
        {...base}
        expansion={expansion}
        expansionResetKey="old"
        defaultPagination={{ pageIndex: 0, pageSize: 1 }}
      />,
    );
    await user.click(toggleFor("Beta"));
    const oldSignal = loadChildren.mock.calls[0]![1] as AbortSignal;
    rerender(
      <DataTable
        {...base}
        expansion={expansion}
        expansionResetKey="new"
        defaultPagination={{ pageIndex: 0, pageSize: 1 }}
      />,
    );
    expect(oldSignal.aborted).toBe(true);
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    await user.click(toggleFor("Beta"));
    await act(async () => next.resolve(["New dataset"]));
    await act(async () => old.resolve(["Old dataset"]));
    expect(screen.getByText("New dataset")).toBeInTheDocument();
    expect(screen.queryByText("Old dataset")).not.toBeInTheDocument();
  });

  it("clears cached success when the dataset reset key changes", async () => {
    const user = userEvent.setup();
    const loadChildren = vi
      .fn()
      .mockResolvedValueOnce(["Old cache"])
      .mockResolvedValueOnce(["New cache"]);
    const expansion: ExpansionConfig<Row, string> = {
      mode: "on-demand",
      loadChildren,
      renderChildren,
    };
    const { rerender } = render(
      <DataTable {...base} expansion={expansion} expansionResetKey="old" />,
    );
    await user.click(toggleFor("Beta"));
    expect(await screen.findByText("Old cache")).toBeInTheDocument();
    rerender(
      <DataTable {...base} expansion={expansion} expansionResetKey="new" />,
    );
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "false");
    await user.click(toggleFor("Beta"));
    expect(await screen.findByText("New cache")).toBeInTheDocument();
    expect(screen.queryByText("Old cache")).not.toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("aborts pending load on unmount without a state-update error", async () => {
    const user = userEvent.setup();
    const pending = deferred<readonly string[]>();
    const loadChildren = vi.fn((row: Row, signal: AbortSignal) => {
      expect(row.id).toBe("b");
      expect(signal).toBeInstanceOf(AbortSignal);
      return pending.promise;
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { unmount } = render(
        <DataTable
          {...base}
          expansion={{ mode: "on-demand", loadChildren, renderChildren }}
        />,
      );
      await user.click(toggleFor("Beta"));
      const signal = loadChildren.mock.calls[0]![1] as AbortSignal;
      unmount();
      expect(signal.aborted).toBe(true);
      await act(async () => pending.reject(new Error("Late failure")));
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe("DataTable detail closing transition", () => {
  beforeEach(() =>
    document.documentElement.style.setProperty("--rz-motion-normal", "220ms"),
  );
  afterEach(() => {
    document.documentElement.style.removeProperty("--rz-motion-normal");
    vi.unstubAllGlobals();
  });

  function completeExit() {
    const shell = document.querySelector(".data-table-detail-shell")!;
    fireEvent.transitionEnd(shell, { propertyName: "grid-template-rows" });
  }

  it("collapses semantically before removing the detail row after transition", () => {
    render(<DataTable {...base} expansion={inline} />);
    fireEvent.click(toggleFor("Beta"));
    const button = toggleFor("Beta");
    const detailId = button.getAttribute("aria-controls")!;
    expect(document.getElementById(detailId)).toHaveTextContent("Beta detail");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", detailId);
    expect(document.getElementById(detailId)).toBeInTheDocument();
    expect(document.querySelector(".data-table-detail-shell")).toHaveAttribute(
      "data-open",
      "false",
    );
    completeExit();
    expect(document.getElementById(detailId)).toBeNull();
    expect(button).not.toHaveAttribute("aria-controls");
  });

  it("removes detail immediately for reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    render(<DataTable {...base} expansion={inline} />);
    fireEvent.click(toggleFor("Beta"));
    const button = toggleFor("Beta");
    const detailId = button.getAttribute("aria-controls")!;
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(detailId)).toBeNull();
  });

  it("returns focus to the toggle before focused detail content closes", () => {
    render(
      <DataTable
        {...base}
        expansion={{
          ...inline,
          renderChildren: () => <button type="button">Child action</button>,
        }}
      />,
    );
    const button = toggleFor("Beta");
    fireEvent.click(button);
    screen.getByRole("button", { name: "Child action" }).focus();
    expect(screen.getByRole("button", { name: "Child action" })).toHaveFocus();
    fireEvent.click(button);
    expect(button).toHaveFocus();
    completeExit();
    expect(button).toHaveFocus();
  });

  it("ignores stale exit completion during rapid re-expansion and a second collapse", () => {
    render(<DataTable {...base} expansion={inline} />);
    const button = toggleFor("Beta");
    fireEvent.click(button);
    const detailId = button.getAttribute("aria-controls")!;
    fireEvent.click(button);
    fireEvent.click(button);
    completeExit();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(detailId)).toBeInTheDocument();
    expect(
      screen.getByRole("table").querySelectorAll("tbody td[colspan]"),
    ).toHaveLength(1);
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    completeExit();
    expect(document.getElementById(detailId)).toBeNull();
  });

  it("preserves cached on-demand success across animated collapse", async () => {
    const loadChildren = vi.fn(async () => ["Loaded Beta"]);
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    fireEvent.click(toggleFor("Beta"));
    expect(await screen.findByText("Loaded Beta")).toBeInTheDocument();
    fireEvent.click(toggleFor("Beta"));
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "false");
    completeExit();
    expect(screen.queryByText("Loaded Beta")).not.toBeInTheDocument();
    fireEvent.click(toggleFor("Beta"));
    expect(screen.getByText("Loaded Beta")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("finishes closing during loading without reopening when the request resolves", async () => {
    const pending = deferred<readonly string[]>();
    const loadChildren = vi.fn(() => pending.promise);
    render(
      <DataTable
        {...base}
        expansion={{ mode: "on-demand", loadChildren, renderChildren }}
      />,
    );
    fireEvent.click(toggleFor("Beta"));
    expect(screen.getByRole("status")).toHaveTextContent("Loading details");
    fireEvent.click(toggleFor("Beta"));
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "false");
    completeExit();
    await act(async () => pending.resolve(["Cached after close"]));
    expect(toggleFor("Beta")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Cached after close")).not.toBeInTheDocument();
    fireEvent.click(toggleFor("Beta"));
    expect(screen.getByText("Cached after close")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });
});
