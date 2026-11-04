import { NavLink, useLocation } from "react-router-dom";
import { FiHome, FiShoppingBag, FiBox, FiMoreHorizontal } from "react-icons/fi";

type AdminMobileNavProps = {
  onOpenMore: () => void;
};

const items = [
  { label: "Dashboard", path: "/admin", icon: FiHome, end: true },
  { label: "Orders", path: "/admin/orders", icon: FiShoppingBag },
  { label: "Products", path: "/admin/products", icon: FiBox },
];

export default function AdminMobileNav({ onOpenMore }: AdminMobileNavProps) {
  const location = useLocation();

  const morePaths = [
    "/admin/inventory",
    "/admin/dispatch",
    "/admin/delivery",
    "/admin/tracking",
    "/admin/staff",
    "/admin/reports",
    "/admin/settings",
    "/admin/customers",
  ];

  const moreActive = morePaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <nav
      aria-label="Mobile admin navigation"
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--color-border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className="grid h-[66px] grid-cols-4">
        {items.map((item) => {
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
          className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
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
