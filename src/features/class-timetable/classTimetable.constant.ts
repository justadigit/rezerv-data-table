import type { ClassStatus } from "./classTimetable.type";

export const STATUS_LABEL: Record<ClassStatus, string> = {
  scheduled: "Scheduled",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_ORDER: Record<ClassStatus, number> = {
  scheduled: 0,
  "in-progress": 1,
  completed: 2,
  cancelled: 3,
};
