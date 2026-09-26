import type {
  UserActivity,
  UserRecord,
  UserRole,
  UserStatus,
} from "./usersDemo.type";

const firstNames = [
  "Avery",
  "Jordan",
  "Morgan",
  "Taylor",
  "Riley",
  "Quinn",
  "Cameron",
  "Parker",
  "Drew",
  "Sage",
  "Casey",
  "Rowan",
];
const lastNames = [
  "Morgan",
  "Chen",
  "Patel",
  "Brooks",
  "Rivera",
  "Kim",
  "Nguyen",
  "Davis",
  "Wilson",
  "Reed",
  "Flores",
  "Bennett",
];
const roles: readonly UserRole[] = [
  "Owner",
  "Manager",
  "Member",
  "Member",
  "Member",
  "Manager",
];
const statuses: readonly UserStatus[] = [
  "Active",
  "Active",
  "Invited",
  "Active",
  "Suspended",
  "Active",
];

export const USERS: readonly UserRecord[] = Array.from(
  { length: 72 },
  (_, index) => {
    const number = index + 1;
    const firstName = firstNames[index % firstNames.length]!;
    const lastName =
      lastNames[
        (Math.floor(index / firstNames.length) + (index % firstNames.length)) %
          lastNames.length
      ]!;
    const name = `${firstName} ${lastName}`;
    const status = statuses[index % statuses.length]!;
    return {
      id: `user-${String(number).padStart(3, "0")}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@example.com`,
      role: roles[index % roles.length]!,
      status,
      createdAt: `2026-${String(1 + Math.floor(index / 12)).padStart(2, "0")}-${String(2 + (index % 12)).padStart(2, "0")}T09:00:00Z`,
      lastActiveAt:
        status === "Invited"
          ? null
          : `2026-09-${String(5 + (index % 20)).padStart(2, "0")}T14:30:00Z`,
    };
  },
);

export function activityForUser(user: UserRecord): readonly UserActivity[] {
  if (user.id === "user-002") return [];
  return [
    {
      id: `${user.id}-1`,
      action: "Signed in",
      device: "Chrome · macOS",
      occurredAt: "2026-09-25T09:20:00Z",
    },
    {
      id: `${user.id}-2`,
      action: "Updated profile",
      device: "Safari · iPhone",
      occurredAt: "2026-09-21T13:15:00Z",
    },
  ];
}
