import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiBox,
  FiTruck,
  FiUsers,
  FiMapPin,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiLoader,
} from "react-icons/fi";

import {
  adminLogout,
  type AdminPermission,
  type AdminUser,
} from "../../../lib/api";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  admin: AdminUser;
};

type NavigationItem = {
  label: string;
  path: string;
  icon: IconType;
  permission: AdminPermission;
  end?: boolean;
  badge?: string;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: FiHome,
        permission: "dashboard.view",
        end: true,
      },
      {
        label: "Orders",
        path: "/admin/orders",
        icon: FiShoppingBag,
        permission: "orders.view",
        badge: "12",
      },
      {
        label: "Inventory",
        path: "/admin/inventory",
        icon: FiPackage,
        permission: "inventory.view",
      },
      {
        label: "Customers",
        path: "/admin/customers",
        icon: FiUsers,
        permission: "customers.view",
      },
    ],
  },
  {
    title: "Fulfilment",
    items: [
      {
        label: "Dispatch",
        path: "/admin/dispatch",
        icon: FiBox,
        permission: "dispatch.view",
      },
      {
        label: "Delivery Fees",
        path: "/admin/delivery-fees",
        icon: FiTruck,
        permission: "delivery.manage",
      },
      {
        label: "Tracking",
        path: "/admin/tracking",
        icon: FiMapPin,
        permission: "tracking.manage",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Revenue",
        path: "/admin/revenue",
        icon: FiTrendingUp,
        permission: "reports.view",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        label: "Users & Roles",
        path: "/admin/users",
        icon: FiUsers,
        permission: "staff.view",
      },
    ],
  },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
  admin,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const isSuperAdmin = admin.adminType === "super_admin";

  const adminPermissions = admin.adminRole?.permissions ?? [];

  const visibleNavigationGroups = useMemo(() => {
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => isSuperAdmin || adminPermissions.includes(item.permission),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [isSuperAdmin, adminPermissions]);

  const displayedRole = isSuperAdmin
    ? "Super Admin"
    : (admin.adminRole?.name ?? "Staff");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await adminLogout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Admin logout failed:", error);
      setLoggingOut(false);
    }
  }

  const initials = admin.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 252 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden bg-[var(--color-ink)] text-white lg:flex"
    >
      {/* Brand */}
      <div
        className={`relative flex h-[76px] shrink-0 items-center ${
          collapsed ? "justify-center px-3" : "justify-start px-5"
        }`}
      >
        <NavLink
          to="/admin"
          aria-label="Ogim Store admin dashboard"
          title="Ogim Store"
          className={`flex min-w-0 items-center ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <img
            src="/ogim.webp"
            alt="Ogim Store"
            className="h-9 w-9 shrink-0 object-contain"
          />

          {!collapsed && (
            <span className="whitespace-nowrap font-heading text-xl font-bold tracking-[-0.04em] text-white">
              Ogim Store
            </span>
          )}
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
        {visibleNavigationGroups.map((group) => (
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

      {/* Admin profile and logout */}
      <div className="shrink-0 border-t border-white/15 p-3">
        <div
          className={`flex items-center rounded-xl p-2 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold uppercase text-white">
            {initials}
          </span>

          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {admin.fullName}
              </span>

              <span className="block truncate text-xs capitalize text-white/55">
                {displayedRole}
              </span>
            </span>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? "Logout" : undefined}
          className={`mt-2 flex min-h-[42px] w-full items-center rounded-[var(--radius-control)] text-sm font-medium text-white/85 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60 ${
            collapsed ? "justify-center px-2" : "gap-3 px-3"
          }`}
        >
          {loggingOut ? (
            <FiLoader className="shrink-0 animate-spin" size={19} />
          ) : (
            <FiLogOut className="shrink-0" size={19} />
          )}

          {!collapsed && (
            <span>{loggingOut ? "Signing out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
