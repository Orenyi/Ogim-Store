import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiTruck,
  FiEdit2,
  FiMessageSquare,
} from "react-icons/fi";

import type { AdminOrder } from "../../types/orders.types";

export default function DeliveryInfoCard({ order }: { order: AdminOrder }) {
  const address = order.deliveryAddress;
  const delivery = order.delivery;

  return (
    <section className="admin-order-card">
      <div className="flex items-center justify-between gap-3">
        <div className="admin-order-card-heading">
          <FiMapPin />
          <h2>Delivery Information</h2>
        </div>

        <button
          type="button"
          disabled
          title="Delivery editing will be enabled when the delivery API is connected."
          aria-label="Edit delivery information (coming soon)"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] opacity-60"
        >
          <FiEdit2 size={15} />
        </button>
      </div>

      {address ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <FiMapPin
              className="mt-0.5 shrink-0 text-[var(--color-muted)]"
              size={16}
            />

            <p className="text-xs leading-5 text-[var(--color-ink)]">
              {address.addressLine}
              <br />
              {address.city}, {address.state}
              {address.country ? (
                <>
                  ,<br />
                  {address.country}
                </>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <FiMail size={15} className="shrink-0 text-[var(--color-muted)]" />

            <p className="text-xs text-[var(--color-ink)]">
              Recipient: {address.recipient || "Not provided"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <FiPhone size={15} className="shrink-0 text-[var(--color-muted)]" />

            <p className="text-xs text-[var(--color-ink)]">
              {address.phoneNumber || "Phone number not provided"}
            </p>
          </div>

          {address.instructions?.trim() && (
            <div className="flex items-start gap-2.5">
              <FiMessageSquare
                size={15}
                className="mt-0.5 shrink-0 text-[var(--color-muted)]"
              />

              <div>
                <p className="text-xs font-medium text-[var(--color-ink)]">
                  Delivery Instructions
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                  {address.instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          Delivery address is not available.
        </p>
      )}

      <div className="mt-4 space-y-3 rounded-xl bg-[var(--color-surface-muted)] p-3">
        <div className="admin-order-detail-row">
          <span className="flex items-center gap-2">
            <FiTruck size={15} />
            Delivery Method
          </span>

          <strong>{delivery?.method || "Not specified"}</strong>
        </div>

        <div className="admin-order-detail-row">
          <span>Delivery Fee</span>

          <strong>
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            }).format(order.deliveryFee)}
          </strong>
        </div>
      </div>
    </section>
  );
}
