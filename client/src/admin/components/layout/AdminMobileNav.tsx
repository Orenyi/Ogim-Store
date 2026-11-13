import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiMoreHorizontal,
  FiPackage,
} from "react-icons/fi";

import type { AdminPermission, AdminUser } from "../../../lib/api";

type AdminMobileNavProps = {
  onOpenMore: () => void;
  admin: AdminUser;
};

const items: {
  label: string;
  path: string;
  icon: typeof FiHome;
  permission: AdminPermission;
  end?: boolean;
}[] = [
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
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: FiPackage,
    permission: "inventory.view",
  },
];

export default function AdminMobileNav({
  onOpenMore,
  admin,
}: AdminMobileNavProps) {
  const location = useLocation();

  const isSuperAdmin = admin.adminType === "super_admin";
  const adminPermissions = admin.adminRole?.permissions ?? [];

  const visibleItems = items.filter(
    (item) => isSuperAdmin || adminPermissions.includes(item.permission),
  );

  const morePaths = [
    "/admin/dispatch",
    "/admin/delivery-fees",
    "/admin/tracking",
    "/admin/users",
    "/admin/revenue",
    "/admin/customers",
  ];

  const moreActive = morePaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  return (
    <nav
      aria-label="Mobile admin navigation"
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--color-border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div
        className="grid h-[66px]"
        style={{
          gridTemplateColumns: `repeat(${visibleItems.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={onOpenMore}
          aria-expanded={moreActive}
          aria-label="Open more admin navigation options"
          className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
            moreActive
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)]"
          }`}
        >
          <FiMoreHorizontal size={22} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
