import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
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

export default function AccountMobileMenu() {
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
    <section
      aria-label="Mobile account menu"
      className="mb-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] lg:hidden"
    >
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] p-4">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-stone)] text-sm font-bold text-[var(--color-ink)]"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
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

      <nav aria-label="Mobile account navigation" className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]",
                ].join(" ")
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              <FiChevronRight size={16} aria-hidden="true" />
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-error-soft)] hover:text-[var(--color-error)]"
        >
          <FiLogOut size={18} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </nav>
    </section>
  );
}
