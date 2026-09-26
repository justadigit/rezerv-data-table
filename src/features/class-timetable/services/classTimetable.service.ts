import { mockTransport } from "@/core/api";
import { CLASS_SESSIONS, rosterForClass } from "../classTimetable.mock";
import type {
  Attendee,
  ClassSession,
  InitialFixture,
} from "../classTimetable.type";

function normalizeError(error: unknown, message: string): Error {
  if (error instanceof DOMException && error.name === "AbortError")
    return error;
  return new Error(message);
}

export async function loadClasses(
  fixture: InitialFixture,
  attempt: number,
  signal: AbortSignal,
): Promise<readonly ClassSession[]> {
  try {
    return await mockTransport<readonly ClassSession[]>(
      fixture === "empty" ? [] : CLASS_SESSIONS,
      { latencyMs: 450, fail: fixture === "error" && attempt === 0, signal },
    );
  } catch (error) {
    throw normalizeError(
      error,
      "Classes could not be loaded. Please try again.",
    );
  }
}

const rosterAttempts = new Map<string, number>();

export async function loadAttendees(
  session: ClassSession,
  signal: AbortSignal,
): Promise<readonly Attendee[]> {
  const attempt = rosterAttempts.get(session.id) ?? 0;
  rosterAttempts.set(session.id, attempt + 1);
  try {
    return await mockTransport(rosterForClass(session), {
      latencyMs: session.rosterScenario === "slow" ? 1400 : 500,
      fail: session.rosterScenario === "retry" && attempt === 0,
      signal,
    });
  } catch (error) {
    throw normalizeError(
      error,
      `Attendees for ${session.className} could not be loaded.`,
    );
  }
}

export function resetRosterAttempts() {
  rosterAttempts.clear();
}
