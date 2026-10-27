import { memo } from "react";

interface CartSkeletonProps {
  itemCount?: number;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[var(--color-stone)]/80 ${className}`}
    />
  );
}

function CartSkeleton({ itemCount = 3 }: CartSkeletonProps) {
  return (
    <section
      aria-label="Loading your cart"
      aria-busy="true"
      className="min-w-0"
    >
      <div className="mb-6">
        <SkeletonBlock className="h-8 w-52 max-w-full sm:h-9 sm:w-64" />
        <SkeletonBlock className="mt-3 h-4 w-60 max-w-full" />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {/* Selection toolbar */}
          <div className="mb-3 flex min-h-12 items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="size-[18px] rounded-sm" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
            <SkeletonBlock className="h-4 w-28 max-w-[35%]" />
          </div>

          {/* Product rows */}
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            {Array.from({ length: Math.max(1, itemCount) }).map((_, index) => (
              <div
                key={index}
                className="grid min-w-0 grid-cols-[18px_minmax(0,1fr)] items-center gap-3 p-4 sm:grid-cols-[18px_minmax(0,1fr)] sm:gap-4 sm:px-5 sm:py-5"
              >
                <SkeletonBlock className="size-[18px] rounded-sm" />

                <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-5">
                  <SkeletonBlock className="h-20 w-16 rounded-[var(--radius-control)] sm:h-24 sm:w-[84px]" />

                  <div className="flex min-w-0 flex-col justify-center gap-2.5">
                    <SkeletonBlock className="h-4 w-20" />
                    <SkeletonBlock className="h-4 w-36 max-w-full" />
                    <SkeletonBlock className="h-3 w-28 max-w-full" />

                    <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                      <SkeletonBlock className="h-5 w-28 max-w-full" />
                      <SkeletonBlock className="h-9 w-28 max-w-full rounded-[var(--radius-control)]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price alert placeholder */}
          <SkeletonBlock className="mt-4 h-16 w-full rounded-[var(--radius-control)]" />

          {/* Bottom actions */}
          <div className="mt-4 flex flex-wrap justify-between gap-3">
            <SkeletonBlock className="h-11 w-40 max-w-full rounded-[var(--radius-control)]" />
            <SkeletonBlock className="h-11 w-32 max-w-full rounded-[var(--radius-control)]" />
          </div>
        </div>

        {/* Summary and benefits placeholders */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
            <SkeletonBlock className="h-6 w-36" />

            <div className="mt-6 space-y-5">
              <div className="flex justify-between gap-4">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
              <div className="flex justify-between gap-4">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
              <div className="border-t border-[var(--color-border)] pt-4">
                <div className="flex justify-between gap-4">
                  <SkeletonBlock className="h-5 w-16" />
                  <SkeletonBlock className="h-5 w-28" />
                </div>
              </div>
            </div>

            <SkeletonBlock className="mt-5 h-12 w-full rounded-[var(--radius-control)]" />

            <div className="mt-5 border-t border-[var(--color-border)] pt-4">
              <SkeletonBlock className="h-4 w-32" />
              <div className="mt-3 flex gap-2">
                <SkeletonBlock className="h-11 min-w-0 flex-1 rounded-[var(--radius-control)]" />
                <SkeletonBlock className="h-11 w-20 rounded-[var(--radius-control)]" />
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4 sm:p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="mb-5 flex items-start gap-3 last:mb-0"
              >
                <SkeletonBlock className="size-10 shrink-0 rounded-full bg-[var(--color-stone)]" />
                <div className="flex-1 space-y-2 pt-1">
                  <SkeletonBlock className="h-4 w-32 max-w-full" />
                  <SkeletonBlock className="h-3 w-full" />
                  <SkeletonBlock className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CartSkeleton);
