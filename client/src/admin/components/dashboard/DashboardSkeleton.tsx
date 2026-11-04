function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-[var(--color-surface-muted)] ${className}`}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full sm:h-14 sm:w-14" />

        <div className="min-w-0 flex-1 space-y-3 pt-1">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-7 w-32 max-w-full" />
          <SkeletonBlock className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonPanel({ height }: { height: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="h-8 w-28" />
      </div>

      <SkeletonBlock className={`mt-5 w-full ${height}`} />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading admin dashboard"
      aria-busy="true"
      className="space-y-6 sm:space-y-7"
    >
      <span className="sr-only">Loading dashboard information...</span>

      {/* Welcome section */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-64 max-w-full sm:h-9" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <SkeletonPanel height="h-[245px] sm:h-[290px]" />
        <SkeletonPanel height="h-[245px] sm:h-[290px]" />
      </div>

      {/* Recent orders and quick actions */}
      <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[1.65fr_0.9fr]">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="h-4 w-24" />
          </div>

          <div className="mt-6 space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
                <SkeletonBlock className="h-3 flex-1" />
                <SkeletonBlock className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
          <SkeletonBlock className="h-6 w-32" />

          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-12 w-full rounded-[var(--radius-control)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
