import { mockTransport } from "@/core/api";
import { activityForUser, USERS } from "../usersDemo.mock";
import type {
  UserActivity,
  UserRecord,
  UsersPage,
  UsersQuery,
} from "../usersDemo.type";

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});
const roleOrder = { Owner: 0, Manager: 1, Member: 2 } as const;
const statusOrder = { Active: 0, Invited: 1, Suspended: 2 } as const;

const sorters: Record<string, (left: UserRecord, right: UserRecord) => number> =
  {
    name: (left, right) => collator.compare(left.name, right.name),
    email: (left, right) => collator.compare(left.email, right.email),
    role: (left, right) => roleOrder[left.role] - roleOrder[right.role],
    status: (left, right) =>
      statusOrder[left.status] - statusOrder[right.status],
    createdAt: (left, right) => left.createdAt.localeCompare(right.createdAt),
    lastActiveAt: (left, right) =>
      (left.lastActiveAt ?? "").localeCompare(right.lastActiveAt ?? ""),
  };

function normalizeError(error: unknown, message: string) {
  if (error instanceof DOMException && error.name === "AbortError")
    return error;
  return new Error(message);
}

export async function fetchUsersPage(
  query: UsersQuery,
  signal: AbortSignal,
): Promise<UsersPage> {
  const source = query.fixture === "empty" ? [] : USERS;
  const compare = query.sortBy ? sorters[query.sortBy] : undefined;
  const sorted =
    compare && query.sortOrder
      ? source
          .map((user, index) => ({ user, index }))
          .sort((left, right) => {
            const order =
              compare(left.user, right.user) *
              (query.sortOrder === "desc" ? -1 : 1);
            return order || left.index - right.index;
          })
          .map(({ user }) => user)
      : source;
  const start = (query.page - 1) * query.pageSize;
  const page: UsersPage = {
    items: sorted.slice(start, start + query.pageSize),
    totalCount: source.length,
  };
  try {
    return await mockTransport(page, {
      latencyMs: query.fixture === "slow" && !query.sortBy ? 1300 : 400,
      fail: query.fixture === "error" && (query.attempt ?? 0) === 0,
      signal,
    });
  } catch (error) {
    throw normalizeError(error, "Users could not be loaded. Please try again.");
  }
}

const activityAttempts = new Map<string, number>();

export async function fetchUserActivity(
  user: UserRecord,
  signal: AbortSignal,
): Promise<readonly UserActivity[]> {
  const attempt = activityAttempts.get(user.id) ?? 0;
  activityAttempts.set(user.id, attempt + 1);
  try {
    return await mockTransport(activityForUser(user), {
      latencyMs: user.id === "user-004" ? 1300 : 450,
      fail: user.id === "user-003" && attempt === 0,
      signal,
    });
  } catch (error) {
    throw normalizeError(
      error,
      `Activity for ${user.name} could not be loaded.`,
    );
  }
}

export function resetActivityAttempts() {
  activityAttempts.clear();
}
