import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiX,
  FiPackage,
  FiUsers,
  FiTruck,
  FiMapPin,
  FiTrendingUp,
  FiBarChart2,
  FiSettings,
  FiBox,
  FiLogOut,
} from "react-icons/fi";
import ogimLogo from "../../../assets/images/ogim_logo.webp";

type AdminMobileMenuProps = {
  onClose: () => void;
};

const menuItems = [
  { label: "Inventory", path: "/admin/inventory", icon: FiPackage },
  { label: "Customers", path: "/admin/customers", icon: FiUsers },
  { label: "Dispatch", path: "/admin/dispatch", icon: FiBox },
  { label: "Delivery Fees", path: "/admin/delivery-fees", icon: FiTruck },
  { label: "Order Tracking", path: "/admin/tracking", icon: FiMapPin },
  { label: "Revenue", path: "/admin/reports", icon: FiTrendingUp },
  { label: "Sales", path: "/admin/reports?tab=sales", icon: FiBarChart2 },
  { label: "Users & Roles", path: "/admin/staff", icon: FiUsers },
  { label: "Store Settings", path: "/admin/settings", icon: FiSettings },
];

export default function AdminMobileMenu({ onClose }: AdminMobileMenuProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[var(--z-overlay)] lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-[rgba(21,23,28,0.55)]"
      />

      {/* Drawer */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        className="absolute inset-y-0 left-0 flex w-[min(320px,88vw)] flex-col bg-[var(--color-ink)] text-white shadow-[var(--shadow-dropdown)]"
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link to="/admin" onClick={onClose}>
            <img
              src={ogimLogo}
              alt="Ogim Store"
              className="h-10 max-w-[155px] object-contain brightness-0 invert"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
            More options
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold">
              OS
            </span>
            <span>
              <span className="block text-sm font-semibold">Ogim Admin</span>
              <span className="block text-xs text-white/50">Administrator</span>
            </span>
          </div>

          <button
            type="button"
            disabled
            title="Sign out will be connected to admin authentication"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/45"
          >
            <FiLogOut size={18} />
            Sign out
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
