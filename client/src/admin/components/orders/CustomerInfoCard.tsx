import { FiMail, FiPhone, FiUser } from "react-icons/fi";

import type { AdminOrder } from "../../types/orders.types";

export default function CustomerInfoCard({ order }: { order: AdminOrder }) {
  const customer = order.customer;

  const isDeletedCustomer = customer.fullName === "Deleted Customer";

  const initials =
    customer.initials ||
    customer.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") ||
    "NA";

  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiUser />
        <h2>Customer Information</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-heading text-base font-bold text-[var(--color-ink)]">
          {initials}
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[var(--color-ink)]">
            {customer.fullName || "Unknown Customer"}
          </h3>

          {isDeletedCustomer && (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              This customer account has been deleted.
            </p>
          )}

          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[var(--color-muted)]">
            <FiMail size={13} className="shrink-0" />
            {customer.email || "Email not available"}
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <FiPhone size={13} className="shrink-0" />
            {customer.phoneNumber || "Phone number not available"}
          </p>
        </div>
      </div>
    </section>
  );
}
