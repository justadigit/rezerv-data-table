import type { Attendee, ClassSession } from "../classTimetable.type";

type Props = { attendees: readonly Attendee[]; session: ClassSession };

export function AttendeeList({ attendees, session }: Props) {
  return (
    <section
      aria-label={`Attendees for ${session.className}`}
      className="space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">
          Attendees · {session.className}
        </h3>
        <span className="text-sm text-muted">
          {attendees.length} registered
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {attendees.map((attendee) => (
          <li
            key={attendee.id}
            className="min-w-0 rounded-md border border-line bg-surface p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-ink">{attendee.name}</p>
                <p className="break-all text-xs text-muted">{attendee.email}</p>
              </div>
              <span className="text-xs font-medium text-muted">
                {attendee.checkedIn ? "Checked in" : "Not checked in"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">{attendee.membership}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
