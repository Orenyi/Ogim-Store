import {
  FiShoppingCart,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiPackage,
} from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

import type { OrdersSummary } from "../../types/orders.types";

type Props = {
  summary: OrdersSummary;
};

const formatter = new Intl.NumberFormat("en-NG");

export default function OrdersStats({ summary }: Props) {
  const reduceMotion = useReducedMotion();

  const cards = [
    {
      title: "All Orders",
      value: summary.allOrders,
      icon: FiShoppingCart,
      percentage: "+8.3%",
      tone: "accent",
    },
    {
      title: "Processing",
      value: summary.processing,
      icon: FiClock,
      percentage: "8.7%",
      tone: "neutral",
    },
    {
      title: "In Transit",
      value: summary.inTransit,
      icon: FiTruck,
      percentage: "12.6%",
      tone: "neutral",
    },
    {
      title: "Delivered",
      value: summary.delivered,
      icon: FiCheckCircle,
      percentage: `${summary.allOrders ? ((summary.delivered / summary.allOrders) * 100).toFixed(1) : "0.0"}%`,
      tone: "success",
    },
    {
      title: "Pending Dispatch",
      value: summary.pendingDispatch,
      icon: FiPackage,
      percentage: `${summary.allOrders ? ((summary.pendingDispatch / summary.allOrders) * 100).toFixed(1) : "0.0"}%`,
      tone: "warning",
    },
  ] as const;

  return (
    <section aria-label="Order statistics">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = card.icon;

          const iconColor =
            card.tone === "success"
              ? "var(--color-success)"
              : "var(--color-accent)";

          const badgeStyle =
            card.tone === "success"
              ? {
                  backgroundColor: "var(--color-success-soft)",
                  color: "var(--color-success)",
                }
              : card.tone === "warning"
                ? {
                    backgroundColor: "var(--color-accent-soft)",
                    color: "var(--color-accent)",
                  }
                : card.tone === "accent"
                  ? {
                      backgroundColor: "var(--color-success-soft)",
                      color: "var(--color-success)",
                    }
                  : {
                      backgroundColor: "var(--color-surface-muted)",
                      color: "var(--color-muted)",
                    };

          return (
            <motion.article
              key={card.title}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)] sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] sm:h-12 sm:w-12">
                  <Icon size={21} color={iconColor} strokeWidth={1.8} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-[var(--color-muted)] sm:text-xs">
                    {card.title}
                  </p>

                  <p className="mt-0.5 font-heading text-xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-2xl">
                    {formatter.format(card.value)}
                  </p>

                  <span
                    className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-[11px]"
                    style={badgeStyle}
                  >
                    {card.percentage}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
