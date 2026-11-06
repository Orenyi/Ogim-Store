import { FiBox, FiCheckCircle, FiCircle, FiClock } from "react-icons/fi";

import type { AdminOrder, OrderTimelineEvent } from "../../types/orders.types";

function formatTime(timestamp: string | null): string {
  if (!timestamp) return "Time not recorded";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Time not available";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FulfilmentTimeline({ order }: { order: AdminOrder }) {
  // Display only events returned by the backend.
  // Do not generate artificial fulfilment history on the frontend.
  const events: OrderTimelineEvent[] = order.timeline ?? [];

  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiBox />
        <h2>Fulfilment Timeline</h2>
      </div>

      {events.length > 0 ? (
        <div className="relative ml-1 mt-2">
          {events.map((event, index) => {
            const completed = event.status === "completed";
            const current = event.status === "current";
            const last = index === events.length - 1;

            return (
              <div key={event.id} className="relative flex min-h-[58px] gap-3">
                {!last && (
                  <span
                    className={`absolute left-[6px] top-4 h-full w-px ${
                      completed
                        ? "bg-[var(--color-success)]"
                        : "bg-[var(--color-border-strong)]"
                    }`}
                  />
                )}

                <span
                  className={`relative z-10 mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full ${
                    completed
                      ? "bg-[var(--color-success)] text-white"
                      : current
                        ? "bg-[var(--color-accent)]"
                        : "border-2 border-[var(--color-border-strong)] bg-white"
                  }`}
                >
                  {completed ? (
                    <FiCheckCircle size={11} />
                  ) : current ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : (
                    <FiCircle size={8} className="text-transparent" />
                  )}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1 pb-4 sm:flex-row sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`text-xs font-bold ${
                          event.status === "upcoming"
                            ? "text-[var(--color-muted)]"
                            : "text-[var(--color-ink)]"
                        }`}
                      >
                        {event.title}
                      </p>

                      {current && (
                        <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[9px] font-semibold text-[var(--color-accent)]">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-[11px] leading-4 text-[var(--color-muted)]">
                      {event.description}
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 text-[10px] text-[var(--color-muted)]">
                    {event.timestamp ? (
                      <>{formatTime(event.timestamp)}</>
                    ) : event.status === "upcoming" ? (
                      <>
                        <FiClock size={11} />
                        Awaiting
                      </>
                    ) : (
                      "Time not recorded"
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FiClock size={24} className="text-[var(--color-muted)]" />

          <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
            No timeline events available
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--color-muted)]">
            Timeline activity will appear here when order events are recorded.
          </p>
        </div>
      )}
    </section>
  );
}
