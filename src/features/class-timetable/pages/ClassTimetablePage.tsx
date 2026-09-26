import { useSearchParams } from "react-router";
import type { InitialFixture } from "../classTimetable.type";
import { ClassTimetable } from "../components/ClassTimetable";

export function ClassTimetablePage() {
  const [searchParams] = useSearchParams();
  const value = searchParams.get("fixture");
  const fixture: InitialFixture =
    value === "error" || value === "empty" || value === "stress"
      ? value
      : "success";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Studio operations
        </p>
        <h1 className="foundation-title mt-2 font-bold text-ink">
          Class Timetable
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Review scheduled classes, capacity, and attendee rosters in one place.
        </p>
      </header>
      <ClassTimetable fixture={fixture} />
    </div>
  );
}
