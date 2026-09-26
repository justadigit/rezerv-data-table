import {
  DataTable,
  type ColumnDef,
  type ExpansionConfig,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { formatUserDate } from "../usersDemo.helper";
import type { UserActivity, UserRecord, UsersQuery } from "../usersDemo.type";
import { useUsersDemo } from "../hooks/useUsersDemo";
import { fetchUserActivity } from "../services/usersDemo.service";
import { UserActivityList } from "./UserActivityList";
import { UserStatusBadge } from "./UserStatusBadge";

const columns: readonly ColumnDef<UserRecord>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    width: 220,
    pinned: "left",
    cell: ({ row }) => (
      <span className="font-semibold text-ink">{row.name}</span>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    sortable: true,
    width: 290,
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    sortable: true,
    width: 140,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    width: 140,
    cell: ({ row }) => <UserStatusBadge status={row.status} />,
  },
  {
    id: "createdAt",
    header: "Created",
    accessorKey: "createdAt",
    sortable: true,
    width: 150,
    cell: ({ row }) => formatUserDate(row.createdAt),
  },
  {
    id: "lastActiveAt",
    header: "Last active",
    accessorKey: "lastActiveAt",
    sortable: true,
    width: 150,
    cell: ({ row }) => formatUserDate(row.lastActiveAt),
  },
];
const getRowId = (row: UserRecord) => row.id;
const expansion: ExpansionConfig<UserRecord, UserActivity> = {
  mode: "on-demand",
  loadChildren: fetchUserActivity,
  renderChildren: (activity, user) => (
    <UserActivityList user={user} activity={activity} />
  ),
  renderEmpty: ({ row }) => (
    <p className="text-sm text-muted">No recent activity for {row.name}.</p>
  ),
};

export function UsersTable({
  fixture,
}: {
  fixture: NonNullable<UsersQuery["fixture"]>;
}) {
  const {
    items,
    totalCount,
    loading,
    error,
    sorting,
    pagination,
    changeSorting,
    changePagination,
    retry,
  } = useUsersDemo(fixture);
  return (
    <div className="space-y-4">
      {error ? (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={retry}>
            Retry loading users
          </Button>
        </div>
      ) : null}
      <DataTable<UserRecord, UserActivity>
        data={items}
        columns={columns}
        getRowId={getRowId}
        sorting={sorting}
        onSortingChange={changeSorting}
        pagination={pagination}
        onPaginationChange={changePagination}
        manualSorting
        manualPagination
        totalCount={totalCount}
        loading={loading}
        error={error}
        pageSizeOptions={[5, 10, 20]}
        expansion={expansion}
        expansionResetKey={fixture}
      />
    </div>
  );
}
