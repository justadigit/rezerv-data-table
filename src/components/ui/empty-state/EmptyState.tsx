import type { ReactNode } from "react";
import { ModulesIcon } from "@/design";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-line bg-surface p-6 text-center shadow-panel">
      <ModulesIcon aria-hidden="true" className="mx-auto size-8 text-muted" />
      <h2 className="mt-3 text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
