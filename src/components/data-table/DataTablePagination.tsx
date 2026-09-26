import { Button } from "@/components/ui/button";
import { withPageSizeChange } from "./dataTable.state";
import type { PageResult } from "./dataTable.pagination";
import type { PaginationState } from "./dataTable.type";

type Props = {
  page: PageResult<unknown>;
  pageSizeOptions: readonly number[];
  onChange: (next: PaginationState) => void;
};

export function DataTablePagination({
  page,
  pageSizeOptions,
  onChange,
}: Props) {
  const { pagination, pageCount, hasPrevious, hasNext } = page;
  const options = Array.from(
    new Set([...pageSizeOptions, pagination.pageSize]),
  );

  return (
    <nav
      aria-label="Table pagination"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-4 text-sm text-muted sm:px-5"
    >
      <label className="inline-flex items-center gap-2">
        <span>Rows per page</span>
        <select
          className="min-h-10 rounded-md border border-line bg-surface px-2 text-ink"
          value={pagination.pageSize}
          onChange={(event) =>
            onChange(withPageSizeChange(pagination, Number(event.target.value)))
          }
        >
          {options.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <span aria-live="polite">
          Page {pagination.pageIndex + 1} of {Math.max(pageCount, 1)}
        </span>
        <Button
          variant="secondary"
          disabled={!hasPrevious}
          aria-label="Previous page"
          onClick={() =>
            onChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })
          }
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={!hasNext}
          aria-label="Next page"
          onClick={() =>
            onChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })
          }
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
