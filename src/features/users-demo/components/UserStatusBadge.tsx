import type { UserStatus } from "../usersDemo.type";

const classes: Record<UserStatus, string> = {
  Active: "bg-brand text-brand-contrast",
  Invited: "bg-surface-muted text-ink",
  Suspended: "bg-danger-surface text-danger",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}
