import { NavLink, useNavigate } from "react-router-dom";
import { FiGrid, FiShoppingBag, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { label: "Account overview", to: "/account", icon: FiGrid, end: true },
  {
    label: "My orders",
    to: "/account/orders",
    icon: FiShoppingBag,
    end: false,
  },
  { label: "Help & support", to: "/contact", icon: FiHelpCircle, end: false },
];

export default function AccountSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.name?.trim() || "Customer";
  const email = user?.email || "";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "C";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] p-4">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-stone)] text-sm font-bold text-[var(--color-ink)]"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
            {name}
          </p>
          {email && (
            <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
              {email}
            </p>
          )}
        </div>
      </div>

      <nav aria-label="Account navigation" className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]",
                ].join(" ")
              }
            >
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]"
        >
          <FiLogOut size={18} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
