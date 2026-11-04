import { FiTruck, FiClock } from "react-icons/fi";
import type { TrackingEvent } from "../../types/tracking.types";
import { formatTrackingDate } from "../../utils/tracking.utils";

type Props = {
  events: TrackingEvent[];
  title?: string;
};

export default function TrackingTimeline({
  events,
  title = "Tracking Timeline",
}: Props) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiTruck size={20} />
        </span>
        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Order delivery activity and status history.
          </p>
        </div>
      </div>

      {!sortedEvents.length ? (
        <div className="py-10 text-center">
          <FiClock size={23} className="mx-auto text-[var(--color-muted)]" />
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            No tracking updates have been added.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          {sortedEvents.map((event, index) => {
            const isLatest = index === 0;

            return (
              <div key={event.id} className="relative flex gap-3">
                <div className="flex w-5 shrink-0 flex-col items-center">
                  <span
                    className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isLatest
                        ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                        : "border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  </span>

                  {index !== sortedEvents.length - 1 && (
                    <span className="min-h-[65px] w-px flex-1 bg-[var(--color-border-strong)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[var(--color-ink)]">
                          {event.title}
                        </h3>
                        {isLatest && (
                          <span className="rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                        {event.description}
                      </p>
                      {event.note && (
                        <p className="mt-2 rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-xs leading-5 text-[var(--color-ink)]">
                          {event.note}
                        </p>
                      )}
                    </div>

                    <time className="shrink-0 text-[11px] text-[var(--color-muted)] sm:text-xs">
                      {formatTrackingDate(event.timestamp, true)}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
