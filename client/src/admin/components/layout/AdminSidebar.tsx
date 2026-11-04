import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiBox,
  FiPackage,
  FiTruck,
  FiUsers,
  FiMapPin,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";

import ogimLogo from "../../../assets/images/ogim_logo.webp";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const navigationGroups = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", path: "/admin", icon: FiHome, end: true },
      {
        label: "Orders",
        path: "/admin/orders",
        icon: FiShoppingBag,
        badge: "12",
      },
      { label: "Products", path: "/admin/products", icon: FiBox },
      { label: "Inventory", path: "/admin/inventory", icon: FiPackage },
      { label: "Customers", path: "/admin/customers", icon: FiUsers },
    ],
  },
  {
    title: "Fulfilment",
    items: [
      { label: "Dispatch", path: "/admin/dispatch", icon: FiBox },
      { label: "Delivery Fees", path: "/admin/delivery", icon: FiTruck },
      { label: "Tracking", path: "/admin/tracking", icon: FiMapPin },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "Revenue", path: "/admin/reports", icon: FiTrendingUp },
      { label: "Sales", path: "/admin/reports?tab=sales", icon: FiBarChart2 },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Users & Roles", path: "/admin/staff", icon: FiUsers },
      { label: "Store Settings", path: "/admin/settings", icon: FiSettings },
    ],
  },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 252 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden bg-[var(--color-ink)] text-white lg:flex"
    >
      {/* Brand */}
      <div
        className={`relative flex h-[76px] shrink-0 items-center ${
          collapsed ? "justify-center px-3" : "justify-center px-5"
        }`}
      >
        <NavLink to="/admin" aria-label="Ogim Store admin dashboard">
          <img
            src={ogimLogo}
            alt="Ogim Store"
            className={`object-contain brightness-0 invert ${
              collapsed ? "h-9 w-9" : "h-10 max-w-[155px]"
            }`}
          />
        </NavLink>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          {collapsed ? (
            <FiChevronRight size={17} />
          ) : (
            <FiChevronLeft size={17} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-scroll flex-1 overflow-y-auto px-3 pb-5 pt-3">
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-7">
            {!collapsed && (
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                {group.title}
              </p>
            )}

            {collapsed && <div className="mx-auto mb-4 h-px w-8 bg-white/15" />}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      [
                        "group flex min-h-[42px] items-center rounded-[var(--radius-control)] text-sm transition-colors duration-200",
                        collapsed
                          ? "justify-center px-2"
                          : "justify-between gap-3 px-3",
                        isActive
                          ? "bg-[var(--color-accent)] text-white shadow-sm"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      ].join(" ")
                    }
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon size={19} className="shrink-0" />

                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </span>

                    {!collapsed && item.badge && (
                      <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[11px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin profile */}
      <div className="shrink-0 border-t border-white/15 p-3">
        <button
          type="button"
          className={`flex w-full items-center rounded-xl p-2 text-left transition-colors hover:bg-white/10 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white">
            OS
          </span>

          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  Ogim Admin
                </span>
                <span className="block text-xs text-white/55">
                  Administrator
                </span>
              </span>
              <FiChevronDown size={17} className="shrink-0 text-white/70" />
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
