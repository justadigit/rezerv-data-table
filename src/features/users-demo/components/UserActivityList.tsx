import { formatUserDate } from "../usersDemo.helper";
import type { UserActivity, UserRecord } from "../usersDemo.type";

export function UserActivityList({
  user,
  activity,
}: {
  user: UserRecord;
  activity: readonly UserActivity[];
}) {
  return (
    <section aria-label={`Activity for ${user.name}`} className="space-y-3">
      <h3 className="font-semibold text-ink">Recent activity · {user.name}</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {activity.map((item) => (
          <li
            key={item.id}
            className="rounded-md border border-line bg-surface p-3"
          >
            <p className="font-medium text-ink">{item.action}</p>
            <p className="mt-1 text-xs text-muted">
              {item.device} · {formatUserDate(item.occurredAt)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
