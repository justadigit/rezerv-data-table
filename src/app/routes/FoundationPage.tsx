import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ForwardIcon, SuccessIcon } from "@/design";

export type FoundationPageProps = {
  routeName: string;
  plannedFeature: string;
};

export function FoundationPage({
  routeName,
  plannedFeature,
}: FoundationPageProps) {
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-surface p-6 shadow-panel sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Phase 1 foundation
        </p>
        <h1 className="foundation-title mt-3 max-w-2xl font-bold text-ink">
          {routeName}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Routing, design tokens, icons, accessible UI primitives, and test
          tooling are ready.
          {` ${plannedFeature} implementation is pending.`}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => setShowStatus((current) => !current)}>
            {showStatus ? "Hide foundation status" : "Show foundation status"}
            <ForwardIcon aria-hidden="true" className="size-4" />
          </Button>
          {showStatus ? (
            <span
              role="status"
              className="inline-flex items-center gap-2 text-sm text-ink"
            >
              <SuccessIcon aria-hidden="true" className="size-5 text-brand" />
              Foundation preview is working.
            </span>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="primitive-preview-title" className="space-y-4">
        <h2
          id="primitive-preview-title"
          className="text-lg font-semibold text-ink"
        >
          Primitive previews
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            title="Feature content is pending"
            description="This placeholder keeps the route available while the assessment features are built in later phases."
          />
          <ErrorState
            title="Error state preview"
            description="A reusable, readable error message will support future data views."
          />
        </div>
        <div
          role="status"
          aria-label="Skeleton preview"
          className="rounded-lg border border-line bg-surface p-5"
        >
          <p className="mb-4 text-sm font-medium text-muted">
            Loading skeleton preview
          </p>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>
      </section>
    </div>
  );
}
