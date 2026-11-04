import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiRefreshCw,
  FiTruck,
  FiBox,
  FiPlusCircle,
  FiUserPlus,
  FiChevronRight,
} from "react-icons/fi";

const actions = [
  {
    label: "Update Order Status",
    description: "Review and update customer orders",
    path: "/admin/orders",
    icon: FiRefreshCw,
  },
  {
    label: "Manage Delivery Fees",
    description: "Configure delivery charges",
    path: "/admin/delivery",
    icon: FiTruck,
  },
  {
    label: "Create Dispatch",
    description: "Assign orders for delivery",
    path: "/admin/dispatch",
    icon: FiBox,
  },
  {
    label: "Add Product / Stock",
    description: "Manage products and inventory",
    path: "/admin/inventory",
    icon: FiPlusCircle,
  },
  {
    label: "Invite Staff",
    description: "Manage staff access and roles",
    path: "/admin/staff",
    icon: FiUserPlus,
  },
];

export default function QuickActions() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      aria-labelledby="quick-actions-title"
      className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
    >
      <div className="mb-4">
        <h2
          id="quick-actions-title"
          className="font-heading text-lg font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-xl"
        >
          Quick Actions
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Common store management tasks.
        </p>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.label}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.25,
                delay: shouldReduceMotion ? 0 : index * 0.05,
              }}
            >
              <Link
                to={action.path}
                className="group flex min-h-[48px] items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2.5 transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/40 focus-visible:outline-offset-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-ink)] transition-colors group-hover:bg-[var(--color-accent-soft)] group-hover:text-[var(--color-accent)]">
                  <Icon size={18} strokeWidth={1.8} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-[var(--color-ink)] sm:text-sm">
                    {action.label}
                  </span>
                  <span className="mt-0.5 hidden truncate text-[10px] text-[var(--color-muted)] sm:block">
                    {action.description}
                  </span>
                </span>

                <FiChevronRight
                  size={17}
                  className="shrink-0 text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]"
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
