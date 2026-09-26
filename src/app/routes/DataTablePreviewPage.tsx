import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/data-table";

type PreviewRow = {
  id: string;
  name: string;
  category: string;
  amount: number;
  createdAt: Date;
  status: string;
  note: string;
};
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
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Phase 3 preview
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
      <DataTable
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
      />
    </div>
  );
}
