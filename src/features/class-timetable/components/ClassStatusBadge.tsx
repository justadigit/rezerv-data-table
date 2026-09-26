import { STATUS_LABEL } from "../classTimetable.constant";
import type { ClassStatus } from "../classTimetable.type";

const statusClass: Record<ClassStatus, string> = {
  scheduled: "bg-surface-muted text-ink",
  "in-progress": "bg-brand text-brand-contrast",
  completed: "border border-line bg-surface text-muted",
  cancelled: "bg-danger-surface text-danger",
};

export function ClassStatusBadge({ status }: { status: ClassStatus }) {
  return (
    <span
      className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${statusClass[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
