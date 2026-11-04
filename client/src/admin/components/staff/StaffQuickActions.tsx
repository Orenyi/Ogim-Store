import { FiZap, FiUserPlus, FiShield, FiChevronRight } from "react-icons/fi";

type Props = {
  onAddStaff: () => void;
  onManageRoles: () => void;
};

export default function StaffQuickActions({
  onAddStaff,
  onManageRoles,
}: Props) {
  const actions = [
    {
      title: "Add New Staff",
      description: "Create a new admin or staff account.",
      icon: FiUserPlus,
      onClick: onAddStaff,
    },
    {
      title: "Manage Roles",
      description: "Create or update roles and permissions.",
      icon: FiShield,
      onClick: onManageRoles,
    },
  ];

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiZap size={20} />
        </span>
        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            Quick Actions
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Common staff and access management tasks.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={action.onClick}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-3 text-left transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Icon size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[var(--color-ink)]">
                  {action.title}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                  {action.description}
                </span>
              </span>

              <FiChevronRight
                size={18}
                className="shrink-0 text-[var(--color-muted)]"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
