import type { RowId } from "./dataTable.type";

export function getValidatedRowIds<TRow>(
  rows: readonly TRow[],
  getRowId: (row: TRow) => RowId,
): RowId[] {
  const seen = new Set<RowId>();
  return rows.map((row) => {
    const id = getRowId(row);
    if (
      (typeof id !== "string" && typeof id !== "number") ||
      (typeof id === "number" && !Number.isFinite(id))
    ) {
      throw new Error(
        "DataTable getRowId must return a finite number or string",
      );
    }
    if (seen.has(id)) {
      throw new Error(`DataTable duplicate row id: ${String(id)}`);
    }
    seen.add(id);
    return id;
  });
}
