import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  index?: number;
};

export default function StatCard({
  title,
  value,
  icon,
  index = 0,
}: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();

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
        </div>
      </div>
    </motion.article>
  );
}
