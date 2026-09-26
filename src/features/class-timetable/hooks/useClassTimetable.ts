import { useEffect, useState } from "react";
import { loadClasses } from "../services/classTimetable.service";
import type { ClassSession, InitialFixture } from "../classTimetable.type";

type LoadState = {
  rows: readonly ClassSession[];
  loading: boolean;
  error: Error | null;
};

export function useClassTimetable(fixture: InitialFixture) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({
    rows: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    loadClasses(fixture, attempt, controller.signal).then(
      (rows) => setState({ rows, loading: false, error: null }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          rows: [],
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Classes could not be loaded."),
        });
      },
    );
    return () => controller.abort();
  }, [fixture, attempt]);

  function retry() {
    setState({ rows: [], loading: true, error: null });
    setAttempt((current) => current + 1);
  }

  return { ...state, retry };
}
