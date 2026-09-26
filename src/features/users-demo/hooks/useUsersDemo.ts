import { useEffect, useState } from "react";
import type { PaginationState, SortingState } from "@/components/data-table";
import { fetchUsersPage } from "../services/usersDemo.service";
import type { UserRecord, UsersQuery } from "../usersDemo.type";

type Fixture = NonNullable<UsersQuery["fixture"]>;
type PageState = {
  items: readonly UserRecord[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
};

export function useUsersDemo(fixture: Fixture) {
  const [sorting, setSorting] = useState<SortingState>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState<PageState>({
    items: [],
    totalCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const query: UsersQuery = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      fixture,
      attempt,
      ...(sorting
        ? { sortBy: sorting.columnId, sortOrder: sorting.direction }
        : {}),
    };
    fetchUsersPage(query, controller.signal).then(
      (result) => setPage({ ...result, loading: false, error: null }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setPage({
          items: [],
          totalCount: 0,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Users could not be loaded."),
        });
      },
    );
    return () => controller.abort();
  }, [fixture, sorting, pagination, attempt]);

  function changeSorting(next: SortingState) {
    setPage((current) => ({ ...current, loading: true, error: null }));
    setSorting(next);
  }

  function changePagination(next: PaginationState) {
    setPage((current) => ({ ...current, loading: true, error: null }));
    setPagination(next);
  }

  function retry() {
    setPage((current) => ({ ...current, loading: true, error: null }));
    setAttempt((current) => current + 1);
  }

  return {
    ...page,
    sorting,
    pagination,
    changeSorting,
    changePagination,
    retry,
  };
}
