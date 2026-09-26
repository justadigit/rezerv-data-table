import { useEffect, useRef, useState } from "react";
import type { ExpansionConfig, RowId } from "./dataTable.type";

export type RowLoadState<TChild> =
  | { status: "loading" }
  | { status: "success"; children: readonly TChild[] }
  | { status: "error"; error: Error };

type ActiveRequest = { generation: number; controller: AbortController };

export function useRowExpansion<TRow, TChild>(
  expansion: ExpansionConfig<TRow, TChild> | undefined,
) {
  const [expandedIds, setExpandedIds] = useState<Set<RowId>>(() => new Set());
  const [loadStates, setLoadStates] = useState<
    Map<RowId, RowLoadState<TChild>>
  >(() => new Map());
  const generations = useRef(new Map<RowId, number>());
  const activeRequests = useRef(new Map<RowId, ActiveRequest>());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const requests = activeRequests.current;
    return () => {
      mounted.current = false;
      for (const request of requests.values()) request.controller.abort();
      requests.clear();
    };
  }, []);

  function setRowState(rowId: RowId, state: RowLoadState<TChild>) {
    setLoadStates((current) => new Map(current).set(rowId, state));
  }

  function startLoad(row: TRow, rowId: RowId) {
    if (!expansion || expansion.mode !== "on-demand") return;
    activeRequests.current.get(rowId)?.controller.abort();
    const generation = (generations.current.get(rowId) ?? 0) + 1;
    generations.current.set(rowId, generation);
    const controller = new AbortController();
    activeRequests.current.set(rowId, { generation, controller });
    setRowState(rowId, { status: "loading" });

    let request: Promise<readonly TChild[]>;
    try {
      request = Promise.resolve(expansion.loadChildren(row, controller.signal));
    } catch (error) {
      request = Promise.reject(error);
    }

    const isCurrent = () =>
      mounted.current &&
      !controller.signal.aborted &&
      activeRequests.current.get(rowId)?.generation === generation;

    void request.then(
      (children) => {
        if (!isCurrent()) return;
        activeRequests.current.delete(rowId);
        setRowState(rowId, { status: "success", children });
      },
      (error: unknown) => {
        if (!isCurrent()) return;
        activeRequests.current.delete(rowId);
        setRowState(rowId, {
          status: "error",
          error:
            error instanceof Error
              ? error
              : new Error("Unable to load details"),
        });
      },
    );
  }

  function toggle(row: TRow, rowId: RowId) {
    if (expandedIds.has(rowId)) {
      setExpandedIds((current) => {
        const next = new Set(current);
        next.delete(rowId);
        return next;
      });
      return;
    }
    setExpandedIds((current) => new Set(current).add(rowId));
    if (expansion?.mode !== "on-demand") return;
    const state = loadStates.get(rowId);
    if (
      !state ||
      ((state.status === "success" || state.status === "loading") &&
        expansion.cache === false)
    ) {
      startLoad(row, rowId);
    }
  }

  return {
    expandedIds,
    loadStates,
    toggle,
    retry: startLoad,
  };
}
