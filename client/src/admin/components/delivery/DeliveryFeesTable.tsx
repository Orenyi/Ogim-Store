import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMoreHorizontal,
  FiEdit2,
  FiCopy,
  FiPauseCircle,
  FiPlayCircle,
  FiTrash2,
  FiMapPin,
} from "react-icons/fi";

import type { DeliveryFee } from "../../types/delivery.types";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import { formatDeliveryCurrency } from "../../utils/delivery.utils";

type Props = {
  fees: DeliveryFee[];
  loading: boolean;
  onEdit: (fee: DeliveryFee) => void;
  onDuplicate: (fee: DeliveryFee) => void;
  onToggle: (fee: DeliveryFee) => void;
  onDelete: (fee: DeliveryFee) => void;
};

function DeliveryFeeActions({
  fee,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
}: {
  fee: DeliveryFee;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);

  const actions = [
    {
      label: "Edit Fee",
      icon: FiEdit2,
      action: onEdit,
      danger: false,
    },
    {
      label: "Duplicate",
      icon: FiCopy,
      action: onDuplicate,
      danger: false,
    },
    {
      label: fee.status === "active" ? "Deactivate" : "Activate",
      icon: fee.status === "active" ? FiPauseCircle : FiPlayCircle,
      action: onToggle,
      danger: false,
    },
    {
      label: "Delete",
      icon: FiTrash2,
      action: onDelete,
      danger: true,
    },
  ];

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    // Approximate height of the four menu actions.
    const menuHeight = 180;
    const menuGap = 8;

    let top = rect.bottom + menuGap;

    // Open upwards when there isn't enough room below the button.
    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - menuGap;
    }

    // Keep the dropdown inside the visible viewport.
    top = Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8));

    const right = Math.max(8, window.innerWidth - rect.right);

    setPosition({ top, right });
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${fee.location}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggleMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-stone)] hover:text-[var(--color-ink)]"
      >
        <FiMoreHorizontal size={20} />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Click outside to close */}
                <button
                  type="button"
                  aria-label="Close actions menu"
                  className="fixed inset-0 z-[9998] cursor-default"
                  onClick={closeMenu}
                />

                {/* Floating dropdown rendered outside the table */}
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "fixed",
                    top: position.top,
                    right: position.right,
                  }}
                  className="z-[9999] w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-1.5 shadow-[var(--shadow-dropdown)]"
                >
                  {actions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          closeMenu();
                          item.action();
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--color-surface-muted)] ${
                          item.danger
                            ? "text-[var(--color-error)]"
                            : "text-[var(--color-ink)]"
                        }`}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

function DeliveryFeeCard({
  fee,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
}: {
  fee: DeliveryFee;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <FiMapPin size={18} />
          </span>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[var(--color-ink)]">
              {fee.location}
            </h3>

            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              {fee.state}, {fee.country}
            </p>
          </div>
        </div>

        <DeliveryFeeActions
          fee={fee}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-3">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Delivery fee</p>

          <p className="mt-1 text-sm font-extrabold text-[var(--color-ink)]">
            {formatDeliveryCurrency(fee.fee)}
          </p>
        </div>

        <div>
          <p className="text-xs text-[var(--color-muted)]">
            Estimated delivery
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            {fee.estimatedDelivery}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <DeliveryStatusBadge status={fee.status} />
      </div>
    </article>
  );
}

export default function DeliveryFeesTable({
  fees,
  loading,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-[var(--color-stone)]"
          />
        ))}
      </div>
    );
  }

  if (!fees.length) {
    return (
      <div className="px-5 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiMapPin size={22} />
        </span>

        <h3 className="mt-4 font-heading text-base font-bold text-[var(--color-ink)]">
          No delivery locations found
        </h3>

        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)]">
              <th className="px-5 py-4">Location</th>
              <th className="px-4 py-4">State</th>
              <th className="px-4 py-4">Delivery Fee</th>
              <th className="px-4 py-4">Estimated Delivery</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {fees.map((fee) => (
              <tr
                key={fee.id}
                className="border-b border-[var(--color-border)] last:border-0 transition hover:bg-[var(--color-surface-muted)]/60"
              >
                <td className="px-5 py-4 text-sm font-bold text-[var(--color-ink)]">
                  {fee.location}
                </td>

                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                  {fee.state}
                </td>

                <td className="px-4 py-4 text-sm font-bold text-[var(--color-ink)]">
                  {formatDeliveryCurrency(fee.fee)}
                </td>

                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                  {fee.estimatedDelivery}
                </td>

                <td className="px-4 py-4">
                  <DeliveryStatusBadge status={fee.status} />
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <DeliveryFeeActions
                      fee={fee}
                      onEdit={() => onEdit(fee)}
                      onDuplicate={() => onDuplicate(fee)}
                      onToggle={() => onToggle(fee)}
                      onDelete={() => onDelete(fee)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 p-3 md:hidden">
        {fees.map((fee) => (
          <DeliveryFeeCard
            key={fee.id}
            fee={fee}
            onEdit={() => onEdit(fee)}
            onDuplicate={() => onDuplicate(fee)}
            onToggle={() => onToggle(fee)}
            onDelete={() => onDelete(fee)}
          />
        ))}
      </div>
    </>
  );
}
