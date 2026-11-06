import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiX,
  FiPackage,
  FiUsers,
  FiTruck,
  FiMapPin,
  FiTrendingUp,
  FiBarChart2,
  FiBox,
  FiLogOut,
  FiLoader,
} from "react-icons/fi";

import { adminLogout } from "../../../lib/api";
import ogimLogo from "../../../assets/images/ogim_logo.webp";

type AdminMobileMenuProps = {
  onClose: () => void;
  adminName: string;
  adminRole: string;
};

const menuItems = [
  { label: "Inventory", path: "/admin/inventory", icon: FiPackage },
  { label: "Customers", path: "/admin/customers", icon: FiUsers },
  { label: "Dispatch", path: "/admin/dispatch", icon: FiBox },
  { label: "Delivery Fees", path: "/admin/delivery-fees", icon: FiTruck },
  { label: "Order Tracking", path: "/admin/tracking", icon: FiMapPin },
  { label: "Revenue", path: "/admin/revenue", icon: FiTrendingUp },
  { label: "Sales", path: "/admin/reports?tab=sales", icon: FiBarChart2 },
  { label: "Users & Roles", path: "/admin/users", icon: FiUsers },
];

export default function AdminMobileMenu({
  onClose,
  adminName,
  adminRole,
}: AdminMobileMenuProps) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await adminLogout();
      onClose();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Admin logout failed:", error);
      setLoggingOut(false);
    }
  }

  const initials = adminName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        {/* Header */}
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

        {/* Navigation */}
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

        {/* Admin profile and logout */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold uppercase">
              {initials || "A"}
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {adminName}
              </span>

              <span className="block truncate text-xs capitalize text-white/50">
                {adminRole}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <FiLoader size={18} className="animate-spin" />
            ) : (
              <FiLogOut size={18} />
            )}

            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
