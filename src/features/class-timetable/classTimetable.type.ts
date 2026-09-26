export type ClassStatus =
  "scheduled" | "in-progress" | "completed" | "cancelled";

export type Attendee = {
  id: string;
  name: string;
  email: string;
  membership: "Unlimited" | "Class pack" | "Drop-in";
  checkedIn: boolean;
};

export type ClassSession = {
  id: string;
  className: string;
  studio: string;
  instructor: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  attendeeCount: number;
  status: ClassStatus;
  attendeeMode: "inline" | "on-demand";
  attendees?: readonly Attendee[];
  rosterScenario?: "success" | "empty" | "retry" | "slow";
};

export type InitialFixture = "success" | "error" | "empty" | "stress";
