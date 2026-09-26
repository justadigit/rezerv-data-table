import { useSearchParams } from "react-router";
import { UsersTable } from "../components/UsersTable";
import type { UsersQuery } from "../usersDemo.type";

export function UsersDemoPage() {
  const [params] = useSearchParams();
  const value = params.get("fixture");
  const fixture: NonNullable<UsersQuery["fixture"]> =
    value === "error" || value === "empty" || value === "slow"
      ? value
      : "success";
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Reusable table demo
        </p>
        <h1 className="foundation-title mt-2 font-bold text-ink">
          User Directory
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Explore members and recent activity. Sorting and pagination are
          handled by a mocked server response.
        </p>
      </header>
      <UsersTable fixture={fixture} />
    </div>
  );
}
