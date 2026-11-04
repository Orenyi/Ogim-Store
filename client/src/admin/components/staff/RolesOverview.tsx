import { FiLayers, FiShield, FiUsers, FiEdit2 } from "react-icons/fi";
import type { StaffRole } from "../../types/staff.types";

type Props = {
  roles: StaffRole[];
  onEditRole: (role: StaffRole) => void;
};

const roleColors: Record<StaffRole["color"], string> = {
  orange: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  yellow: "bg-amber-100 text-amber-800",
};

export default function RolesOverview({ roles, onEditRole }: Props) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiLayers size={20} />
        </span>
        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            Role Overview
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Access levels and permissions in the system.
          </p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-[var(--color-border)]">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${roleColors[role.color]}`}
            >
              <FiShield size={17} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                {role.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-muted)]">
                {role.description}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                {role.permissions.length} permissions
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] sm:inline-flex">
                <FiUsers size={12} />
                {role.staffCount} staff
              </span>

              <button
                type="button"
                onClick={() => onEditRole(role)}
                aria-label={`Edit ${role.name} permissions`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-stone)] hover:text-[var(--color-accent)]"
              >
                <FiEdit2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
