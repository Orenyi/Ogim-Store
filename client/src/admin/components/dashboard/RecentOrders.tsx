import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

import RecentOrdersTable from "./RecentOrdersTable";

import type { RecentOrder } from "../../types/dashboard.types";

type RecentOrdersProps = {
  orders: RecentOrder[];
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-labelledby="recent-orders-title"
      className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
    >
      {/* Section heading */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="recent-orders-title"
            className="font-heading text-lg font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-xl"
          >
            Recent Orders
          </h2>

          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Keep track of your latest customer orders.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
        >
          View All Orders
          <FiArrowRight size={16} />
        </Link>
      </div>

      <RecentOrdersTable orders={orders} />
    </motion.section>
  );
}
