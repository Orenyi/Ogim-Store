import type { IconType } from "react-icons";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

type AccountStatCardProps = {
  label: string;
  value: number | string;
  linkLabel: string;
  to: string;
  icon: IconType;
  iconClassName?: string;
  index?: number;
};

export default function AccountStatCard({
  label,
  value,
  linkLabel,
  to,
  icon: Icon,
  iconClassName = "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  index = 0,
}: AccountStatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
        delay: shouldReduceMotion ? 0 : index * 0.06,
      }}
      className="flex min-w-0 flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 transition-colors hover:border-[var(--color-border-strong)] sm:p-5"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] ${iconClassName}`}
        >
          <Icon size={17} aria-hidden="true" />
        </span>

        <h2 className="text-xs font-medium text-[var(--color-muted)] sm:text-sm">
          {label}
        </h2>
      </div>

      <p className="mt-4 break-words text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
        {value}
      </p>

      <Link
        to={to}
        className="mt-3 inline-flex items-center gap-1 self-start rounded-sm text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
      >
        {linkLabel}
        <FiArrowRight size={13} aria-hidden="true" />
      </Link>
    </motion.article>
  );
}
