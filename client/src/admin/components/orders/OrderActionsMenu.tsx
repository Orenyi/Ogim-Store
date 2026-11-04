import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMoreHorizontal,
  FiEye,
  FiRefreshCw,
  FiTruck,
  FiMessageCircle,
} from "react-icons/fi";

type Props = {
  orderId: string;
  onUpdateStatus: (orderId: string) => void;
  onCreateDispatch: (orderId: string) => void;
  onSendUpdate: (orderId: string) => void;
};

export default function OrderActionsMenu({
  orderId,
  onUpdateStatus,
  onCreateDispatch,
  onSendUpdate,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const actions = [
    {
      label: "Update Status",
      icon: FiRefreshCw,
      action: () => onUpdateStatus(orderId),
    },
    {
      label: "Create Dispatch",
      icon: FiTruck,
      action: () => onCreateDispatch(orderId),
    },
    {
      label: "Send Update",
      icon: FiMessageCircle,
      action: () => onSendUpdate(orderId),
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Order actions"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
      >
        <FiMoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-[var(--color-border)] bg-white p-1.5 shadow-[var(--shadow-dropdown)]"
          >
            <Link
              to={`/admin/orders/${orderId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
            >
              <FiEye size={15} />
              View Details
            </Link>

            {actions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    item.action();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
