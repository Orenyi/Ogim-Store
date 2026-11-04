import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  percentageChange: number;
  trendLabel?: string;
  trendTone?: "success" | "warning" | "danger" | "neutral";
  index?: number;
};

const trendStyles = {
  success: {
    background: "var(--color-success-soft)",
    color: "var(--color-success)",
  },
  warning: {
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
  },
  danger: {
    background: "var(--color-error-soft)",
    color: "var(--color-error)",
  },
  neutral: {
    background: "var(--color-surface-muted)",
    color: "var(--color-muted)",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  percentageChange,
  trendLabel = "vs previous period",
  trendTone = "success",
  index = 0,
}: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const trend = trendStyles[trendTone];

  const changeText = `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}%`;

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: shouldReduceMotion ? 0 : index * 0.07,
        ease: [0.2, 0, 0, 1],
      }}
      className="group min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] sm:h-14 sm:w-14">
          {icon}
        </div>

        {/* Information */}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-xs font-medium text-[var(--color-muted)] sm:text-sm">
            {title}
          </p>

          <p
            className="mt-1 break-words font-heading text-xl font-extrabold leading-tight tracking-[-0.045em] text-[var(--color-ink)] sm:text-2xl lg:text-[27px]"
            title={value}
          >
            {value}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold sm:text-xs"
              style={{
                backgroundColor: trend.background,
                color: trend.color,
              }}
            >
              {percentageChange > 0 ? "↑" : percentageChange < 0 ? "↓" : "–"}
              {changeText}
            </span>

            <span className="text-[10px] leading-4 text-[var(--color-muted)] sm:text-xs">
              {trendLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
