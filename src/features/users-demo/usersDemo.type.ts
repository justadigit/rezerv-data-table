import type { SortDirection } from "@/components/data-table";

export type UserRole = "Owner" | "Manager" | "Member";
export type UserStatus = "Active" | "Invited" | "Suspended";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string | null;
};

export type UserActivity = {
  id: string;
  action: string;
  device: string;
  occurredAt: string;
};

export type UsersQuery = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortDirection;
  fixture?: "success" | "error" | "empty" | "slow";
  attempt?: number;
};

export type UsersPage = {
  items: readonly UserRecord[];
  totalCount: number;
};
