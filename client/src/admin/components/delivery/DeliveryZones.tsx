import { motion } from "framer-motion";
import { FiMapPin, FiMap } from "react-icons/fi";
import type { DeliveryZone } from "../../types/delivery.types";
import DeliveryStatusBadge from "./DeliveryStatusBadge";

type Props = {
  zones: DeliveryZone[];
};

export default function DeliveryZones({ zones }: Props) {
  if (!zones.length) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-16 text-center">
        <FiMap size={26} className="mx-auto text-[var(--color-muted)]" />
        <h3 className="mt-3 font-heading font-bold text-[var(--color-ink)]">
          No delivery zones yet
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Delivery zones will appear here when configured.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {zones.map((zone, index) => (
        <motion.article
          key={zone.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FiMapPin size={21} />
            </span>
            <DeliveryStatusBadge status={zone.status} />
          </div>

          <h3 className="mt-4 font-heading text-lg font-extrabold text-[var(--color-ink)]">
            {zone.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{zone.state}</p>

          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--color-muted)]">
                Covered locations
              </span>
              <span className="text-sm font-bold text-[var(--color-ink)]">
                {zone.locations.length}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {zone.locations.map((location) => (
                <span
                  key={location}
                  className="rounded-lg bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink)]"
                >
                  {location}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--color-muted)]">
                Estimated delivery
              </span>
              <span className="text-sm font-semibold text-[var(--color-ink)]">
                {zone.estimatedDelivery}
              </span>
            </div>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
