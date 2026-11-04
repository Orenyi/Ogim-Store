import { FiMail, FiPhone, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

import type { AdminOrder } from "../../types/orders.types";

export default function CustomerInfoCard({ order }: { order: AdminOrder }) {
  const customer = order.customer;

  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiUser />
        <h2>Customer Information</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-heading text-base font-bold text-[var(--color-ink)]">
          {customer.initials}
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[var(--color-ink)]">
            {customer.fullName}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[var(--color-muted)]">
            <FiMail size={13} />
            {customer.email}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <FiPhone size={13} />
            {customer.phoneNumber}
          </p>
        </div>
      </div>

      <Link
        to={`/admin/customers/${customer.id}`}
        className="mt-4 flex h-10 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        View Customer
      </Link>
    </section>
  );
}
