import { NavLink, Outlet } from "react-router";
import { ModulesIcon } from "@/design";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-surface text-brand shadow-panel"
      : "text-muted hover:bg-surface-muted hover:text-ink"
  }`;

export function AppLayout() {
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3 font-semibold tracking-tight text-ink">
            <span className="rounded-md bg-brand p-2 text-brand-contrast">
              <ModulesIcon aria-hidden="true" className="size-5" />
            </span>
            <span>Rezerv Engineering</span>
          </div>
          <nav aria-label="Foundation routes" className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navClass}>
              Timetable route
            </NavLink>
            <NavLink to="/demo" className={navClass}>
              Reuse demo route
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  );
}
