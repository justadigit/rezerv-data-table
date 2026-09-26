import type { ReactNode } from "react";
import { AlertIcon } from "@/design";

export type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-line bg-danger-surface p-6"
    >
      <AlertIcon aria-hidden="true" className="size-7 text-danger" />
      <h2 className="mt-3 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
