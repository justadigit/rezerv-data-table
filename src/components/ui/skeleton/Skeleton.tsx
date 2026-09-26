import type { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`foundation-skeleton rounded-sm bg-surface-muted ${className}`}
    />
  );
}
