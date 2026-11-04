import { FiBox, FiCheckCircle, FiCircle } from "react-icons/fi";

import type { AdminOrder, OrderTimelineEvent } from "../../types/orders.types";

const defaultStages = [
  {
    id: "placed",
    title: "Order Placed",
    description: "Customer placed the order.",
  },
  {
    id: "payment",
    title: "Payment Verified",
    description: "Payment confirmation was received.",
  },
  {
    id: "processing",
    title: "Processing",
    description: "Order is being prepared for dispatch.",
  },
  {
    id: "dispatched",
    title: "Dispatched",
    description: "Order has been handed to the delivery partner.",
  },
  {
    id: "transit",
    title: "In Transit",
    description: "Order is on the way to the customer.",
  },
  {
    id: "delivered",
    title: "Delivered",
    description: "Order has been delivered.",
  },
];

function formatTime(timestamp: string | null) {
  if (!timestamp) return "—";

  return new Date(timestamp).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FulfilmentTimeline({ order }: { order: AdminOrder }) {
  const events: OrderTimelineEvent[] =
    order.timeline ||
    defaultStages.map((stage, index) => ({
      ...stage,
      timestamp: index === 0 ? order.orderedAt : null,
      status: index === 0 ? "completed" : "upcoming",
    }));

  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiBox />
        <h2>Fulfilment Timeline</h2>
      </div>

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
                  <p
                    className={`text-xs font-bold ${
                      event.status === "upcoming"
                        ? "text-[var(--color-muted)]"
                        : "text-[var(--color-ink)]"
                    }`}
                  >
                    {event.title}
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-[var(--color-muted)]">
                    {event.description}
                  </p>
                </div>

                <span className="shrink-0 text-[10px] text-[var(--color-muted)]">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
