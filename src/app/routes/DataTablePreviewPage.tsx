import { useEffect, useRef, useState } from "react";
import {
  DataTable,
  type ColumnDef,
  type ExpansionConfig,
} from "@/components/data-table";
import { mockTransport } from "@/core/api";

type PreviewRow = {
  id: string;
  name: string;
  category: string;
  amount: number;
  createdAt: Date;
  status: string;
  note: string;
};
type PreviewChild = { id: string; label: string };
const rows: PreviewRow[] = Array.from({ length: 23 }, (_, index) => ({
  id: `item-${index + 1}`,
  name: `Item ${String(index + 1).padStart(2, "0")}`,
  category: ["Alpha", "Beta", "Gamma"][index % 3]!,
  amount: (index + 1) * 12,
  createdAt: new Date(2026, 0, index + 1),
  status: index % 2 ? "Ready" : "Pending",
  note: `Neutral preview row ${index + 1}`,
}));
const columns: ColumnDef<PreviewRow>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    width: 120,
    pinned: "left",
  },
  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    sortable: true,
    width: 112,
    pinned: "left",
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    sortable: true,
    width: 140,
    align: "right",
  },
  {
    id: "created",
    header: "Created",
    accessorKey: "createdAt",
    sortable: true,
    width: 168,
  },
  { id: "status", header: "Status", accessorKey: "status", width: 150 },
  { id: "note", header: "Note", accessorKey: "note", width: 260 },
];

export function DataTablePreviewPage() {
  const [state, setState] = useState<"success" | "loading" | "error" | "empty">(
    "success",
  );
  const [expansionMode, setExpansionMode] = useState<"inline" | "on-demand">(
    "inline",
  );
  const [scenario, setScenario] = useState<
    "success" | "slow" | "empty" | "retry"
  >("success");
  const attempts = useRef(new Map<string, number>());
  useEffect(() => {
    attempts.current.clear();
  }, [scenario]);
  const renderChildren: ExpansionConfig<
    PreviewRow,
    PreviewChild
  >["renderChildren"] = (children) => (
    <ul className="space-y-1 text-sm text-ink">
      {children.map((child) => (
        <li key={child.id}>{child.label}</li>
      ))}
    </ul>
  );
  const expansion: ExpansionConfig<PreviewRow, PreviewChild> =
    expansionMode === "inline"
      ? {
          mode: "inline",
          getChildren: (row) =>
            row.id === "item-2"
              ? []
              : [{ id: `${row.id}-detail`, label: `Detail for ${row.name}` }],
          renderChildren,
        }
      : {
          mode: "on-demand",
          loadChildren: (row, signal) => {
            const count = attempts.current.get(row.id) ?? 0;
            attempts.current.set(row.id, count + 1);
            const children =
              scenario === "empty"
                ? []
                : [
                    {
                      id: `${row.id}-detail`,
                      label: `Loaded detail for ${row.name}`,
                    },
                  ];
            return mockTransport<readonly PreviewChild[]>(children, {
              latencyMs: scenario === "slow" ? 1600 : 350,
              fail: scenario === "retry" && count === 0,
              signal,
            });
          },
          renderChildren,
        };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Phase 4 preview
        </p>
        <h1 className="foundation-title mt-2 font-bold">Reusable DataTable</h1>
        <p className="mt-3 text-muted">
          Temporary neutral rows for checking table rendering and interaction.
        </p>
      </div>
      <label className="inline-flex items-center gap-3 text-sm font-medium">
        Preview state
        <select
          value={state}
          onChange={(event) => setState(event.target.value as typeof state)}
          className="min-h-10 rounded-md border border-line bg-surface px-3"
        >
          <option value="success">Success</option>
          <option value="loading">Loading</option>
          <option value="error">Error</option>
          <option value="empty">Empty</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-3 text-sm font-medium">
          Expansion mode
          <select
            value={expansionMode}
            onChange={(event) =>
              setExpansionMode(event.target.value as typeof expansionMode)
            }
            className="min-h-10 rounded-md border border-line bg-surface px-3"
          >
            <option value="inline">Inline</option>
            <option value="on-demand">On demand</option>
          </select>
        </label>
        {expansionMode === "on-demand" ? (
          <label className="inline-flex items-center gap-3 text-sm font-medium">
            Load scenario
            <select
              value={scenario}
              onChange={(event) =>
                setScenario(event.target.value as typeof scenario)
              }
              className="min-h-10 rounded-md border border-line bg-surface px-3"
            >
              <option value="success">Success</option>
              <option value="slow">Slow success</option>
              <option value="empty">Empty</option>
              <option value="retry">Fail once, then retry</option>
            </select>
          </label>
        ) : null}
      </div>
      <DataTable<PreviewRow, PreviewChild>
        data={state === "empty" ? [] : rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={state === "loading"}
        error={
          state === "error"
            ? new Error("Preview data could not be loaded.")
            : null
        }
        pageSizeOptions={[5, 10, 20]}
        defaultPagination={{ pageIndex: 0, pageSize: 5 }}
        expansion={expansion}
        expansionResetKey={`${expansionMode}:${scenario}:${state === "empty" ? "empty" : "rows"}`}
      />
    </div>
  );
}
