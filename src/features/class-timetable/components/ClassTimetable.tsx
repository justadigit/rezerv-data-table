import {
  DataTable,
  type ColumnDef,
  type ExpansionConfig,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { STATUS_ORDER } from "../classTimetable.constant";
import { formatAttendance, formatClassTime } from "../classTimetable.helper";
import type {
  Attendee,
  ClassSession,
  InitialFixture,
} from "../classTimetable.type";
import { useClassTimetable } from "../hooks/useClassTimetable";
import { loadAttendees } from "../services/classTimetable.service";
import { AttendeeList } from "./AttendeeList";
import { ClassStatusBadge } from "./ClassStatusBadge";

const columns: readonly ColumnDef<ClassSession>[] = [
  {
    id: "class",
    header: "Class",
    accessorKey: "className",
    sortable: true,
    width: 250,
    pinned: "left",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-semibold text-ink">{row.className}</p>
        <p className="text-xs text-muted">{row.studio}</p>
      </div>
    ),
  },
  {
    id: "instructor",
    header: "Instructor",
    accessorKey: "instructor",
    sortable: true,
    width: 170,
  },
  {
    id: "start",
    header: "Start time",
    accessorKey: "startTime",
    sortable: true,
    width: 190,
    cell: ({ row }) => formatClassTime(row.startTime),
  },
  {
    id: "duration",
    header: "Duration",
    accessorKey: "durationMinutes",
    sortable: true,
    width: 120,
    cell: ({ row }) => `${row.durationMinutes} min`,
  },
  {
    id: "attendance",
    header: "Attendance",
    accessorKey: "attendeeCount",
    sortable: true,
    width: 140,
    cell: ({ row }) => formatAttendance(row.attendeeCount, row.capacity),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    compare: (left, right) =>
      STATUS_ORDER[left.status] - STATUS_ORDER[right.status],
    width: 140,
    cell: ({ row }) => <ClassStatusBadge status={row.status} />,
  },
];

const getRowId = (row: ClassSession) => row.id;
const renderAttendees: ExpansionConfig<
  ClassSession,
  Attendee
>["renderChildren"] = (children, row) => (
  <AttendeeList attendees={children} session={row} />
);
const inlineExpansion: ExpansionConfig<ClassSession, Attendee> = {
  mode: "inline",
  getChildren: (row) => row.attendees ?? [],
  renderChildren: renderAttendees,
};
const onDemandExpansion: ExpansionConfig<ClassSession, Attendee> = {
  mode: "on-demand",
  loadChildren: loadAttendees,
  renderChildren: renderAttendees,
};

export function ClassTimetable({ fixture }: { fixture: InitialFixture }) {
  const { rows, loading, error, retry } = useClassTimetable(fixture);
  const inlineRows = rows.filter((row) => row.attendeeMode === "inline");
  const onDemandRows = rows.filter((row) => row.attendeeMode === "on-demand");

  return (
    <div className="space-y-8">
      <section aria-labelledby="scheduled-classes-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="scheduled-classes-title"
              className="text-lg font-semibold text-ink"
            >
              Class schedule
            </h2>
            <p className="mt-1 text-sm text-muted">
              Attendee details are ready when you open a class.
            </p>
          </div>
          {error ? (
            <Button variant="secondary" onClick={retry}>
              Retry loading classes
            </Button>
          ) : null}
        </div>
        <DataTable<ClassSession, Attendee>
          data={inlineRows}
          columns={columns}
          getRowId={getRowId}
          loading={loading}
          error={error}
          pageSizeOptions={[5, 10, 20]}
          defaultPagination={{ pageIndex: 0, pageSize: 5 }}
          expansion={inlineExpansion}
        />
      </section>

      {!loading && !error && rows.length > 0 ? (
        <section aria-labelledby="live-rosters-title" className="space-y-4">
          <div>
            <h2
              id="live-rosters-title"
              className="text-lg font-semibold text-ink"
            >
              Live rosters
            </h2>
            <p className="mt-1 text-sm text-muted">
              Attendee lists load when you open a class.
            </p>
          </div>
          <DataTable<ClassSession, Attendee>
            data={onDemandRows}
            columns={columns}
            getRowId={getRowId}
            pageSizeOptions={[5, 10]}
            defaultPagination={{ pageIndex: 0, pageSize: 5 }}
            expansion={onDemandExpansion}
          />
        </section>
      ) : null}
    </div>
  );
}
