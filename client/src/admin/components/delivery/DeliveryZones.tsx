import { motion } from "framer-motion";
import { FiMapPin, FiMap, FiEdit2, FiTrash2, FiPower } from "react-icons/fi";

import type { DeliveryZone } from "../../types/delivery.types";
import DeliveryStatusBadge from "./DeliveryStatusBadge";

type Props = {
  zones: DeliveryZone[];
  onEdit: (zone: DeliveryZone) => void;
  onToggle: (zone: DeliveryZone) => void;
  onDelete: (zone: DeliveryZone) => void;
  loading?: boolean;
};

export default function DeliveryZones({
  zones,
  onEdit,
  onToggle,
  onDelete,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-5"
          >
            <div className="h-11 w-11 rounded-xl bg-[var(--color-stone)]" />
            <div className="mt-4 h-5 w-32 rounded bg-[var(--color-stone)]" />
            <div className="mt-2 h-4 w-24 rounded bg-[var(--color-stone)]" />
            <div className="mt-5 h-16 rounded bg-[var(--color-stone)]" />
          </div>
        ))}
      </section>
    );
  }

  if (!zones.length) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-16 text-center">
        <FiMap size={26} className="mx-auto text-[var(--color-muted)]" />

        <h3 className="mt-3 font-heading font-bold text-[var(--color-ink)]">
          No delivery zones yet
        </h3>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Create a delivery zone to configure the locations your store serves.
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

          <div className="mt-5 flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
            <button
              type="button"
              onClick={() => onEdit(zone)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] px-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)]"
            >
              <FiEdit2 size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onToggle(zone)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] px-2 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)]"
            >
              <FiPower size={14} />
              {zone.status === "active" ? "Deactivate" : "Activate"}
            </button>

            <button
              type="button"
              onClick={() => onDelete(zone)}
              aria-label={`Delete ${zone.name} delivery zone`}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-error)]/20 text-[var(--color-error)] transition hover:bg-[var(--color-error-soft)]"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
