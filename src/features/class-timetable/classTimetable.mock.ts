import type {
  Attendee,
  ClassSession,
  ClassStatus,
} from "./classTimetable.type";

const attendeeNames = [
  "Maya Chen",
  "Noah Williams",
  "Sofia Patel",
  "Liam Brooks",
  "Ava Martinez",
  "Ethan Kim",
  "Isla Morgan",
  "Oliver Reed",
  "Amelia Nguyen",
  "Lucas Brown",
  "Zoe Carter",
  "Leo Thompson",
  "Chloe Rivera",
  "Aria Davis",
  "Mason Lee",
  "Nina Flores",
  "Ella Johnson",
  "Kai Robinson",
  "Ruby Wilson",
  "Henry Adams",
];

const attendees: Attendee[] = attendeeNames.map((name, index) => ({
  id: `attendee-${index + 1}`,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  membership: (["Unlimited", "Class pack", "Drop-in"] as const)[index % 3]!,
  checkedIn: index % 3 !== 0,
}));

const classNames = [
  "Strength Fundamentals",
  "Morning Flow Yoga",
  "Cycle Intervals",
  "Pilates Foundations",
  "Functional Fitness",
  "Restorative Yoga",
  "Core & Balance",
  "Barre Sculpt",
  "Power Vinyasa",
  "Boxing Basics",
  "Mobility Lab",
  "HIIT Express",
];
const instructors = [
  "Jordan Lee",
  "Priya Shah",
  "Alex Rivera",
  "Sam Taylor",
  "Morgan Wells",
  "Casey Park",
];
const statuses: ClassStatus[] = [
  "scheduled",
  "scheduled",
  "in-progress",
  "completed",
  "scheduled",
  "cancelled",
];

export const CLASS_SESSIONS: readonly ClassSession[] = Array.from(
  { length: 28 },
  (_, index) => {
    const number = index + 1;
    const onDemand = index >= 20;
    const attendeeCount = index === 1 || index === 21 ? 0 : 5 + (index % 12);
    const hour = 7 + (index % 11);
    const day = 5 + Math.floor(index / 4);
    const rosterScenario: NonNullable<ClassSession["rosterScenario"]> =
      index === 21
        ? "empty"
        : index === 22
          ? "retry"
          : index === 23
            ? "slow"
            : "success";
    const status = statuses[index % statuses.length]!;
    const date =
      status === "completed"
        ? "2026-09-24"
        : status === "in-progress"
          ? "2026-09-26"
          : `2026-10-${String(day).padStart(2, "0")}`;
    return {
      id: `class-${String(number).padStart(2, "0")}`,
      className: classNames[index % classNames.length]!,
      studio: `Studio ${["A", "B", "C"][index % 3]}`,
      instructor: instructors[index % instructors.length]!,
      startTime: `${date}T${String(hour).padStart(2, "0")}:00:00Z`,
      durationMinutes: [45, 50, 60][index % 3]!,
      capacity: [16, 20, 24][index % 3]!,
      attendeeCount,
      status,
      attendeeMode: onDemand ? "on-demand" : "inline",
      ...(onDemand
        ? { rosterScenario }
        : {
            attendees: attendees.slice(index % 5, (index % 5) + attendeeCount),
          }),
    };
  },
);

export function rosterForClass(session: ClassSession): readonly Attendee[] {
  if (session.rosterScenario === "empty") return [];
  const start = Number(session.id.slice(-2)) % 5;
  return attendees.slice(start, start + session.attendeeCount);
}

let stressClasses: readonly ClassSession[] | undefined;

export function getStressClasses(): readonly ClassSession[] {
  stressClasses ??= Array.from({ length: 5000 }, (_, index) => ({
    ...CLASS_SESSIONS[index % 20]!,
    id: `stress-class-${String(index + 1).padStart(4, "0")}`,
    className: `Studio Session ${String(index + 1).padStart(4, "0")}`,
    attendeeMode: "inline" as const,
    attendees: [],
  }));
  return stressClasses;
}
