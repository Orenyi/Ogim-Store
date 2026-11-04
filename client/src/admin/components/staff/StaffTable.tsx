import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMoreHorizontal,
  FiEdit2,
  FiUserX,
  FiUserCheck,
  FiMail,
} from "react-icons/fi";
import type { AdminStaff, StaffRole } from "../../types/staff.types";

type Props = {
  staff: AdminStaff[];
  roles: StaffRole[];
  loading: boolean;
  onEdit: (staff: AdminStaff) => void;
  onStatusChange: (staff: AdminStaff) => void;
};

const roleColors: Record<StaffRole["color"], string> = {
  orange: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  yellow: "bg-amber-100 text-amber-800",
};

function StaffStatus({ status }: { status: AdminStaff["status"] }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
          : "bg-[var(--color-error-soft)] text-[var(--color-error)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StaffActions({
  staff,
  onEdit,
  onStatusChange,
}: {
  staff: AdminStaff;
  onEdit: () => void;
  onStatusChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = staff.status === "active";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${staff.fullName}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-stone)] hover:text-[var(--color-ink)]"
      >
        <FiMoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close staff actions"
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-1.5 shadow-[var(--shadow-dropdown)]"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
              >
                <FiEdit2 size={16} />
                Edit Staff
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onStatusChange();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
              >
                {active ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                {active ? "Deactivate" : "Activate"}
              </button>

              <a
                href={`mailto:${staff.email}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
              >
                <FiMail size={16} />
                Send Email
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StaffAvatar({ staff }: { staff: AdminStaff }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-bold text-[var(--color-ink)]">
      {staff.initials}
    </span>
  );
}

function StaffRoleBadge({ role }: { role?: StaffRole }) {
  if (!role) {
    return (
      <span className="text-xs text-[var(--color-muted)]">Unassigned</span>
    );
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${roleColors[role.color]}`}
    >
      {role.name}
    </span>
  );
}

function formatLastLogin(value: string | null) {
  if (!value) return "Never logged in";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function StaffTable({
  staff,
  roles,
  loading,
  onEdit,
  onStatusChange,
}: Props) {
  const roleMap = new Map(roles.map((role) => [role.id, role]));

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-14 animate-pulse rounded-xl bg-[var(--color-stone)]"
          />
        ))}
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="px-5 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiMail size={21} />
        </span>
        <h3 className="mt-3 font-heading font-bold text-[var(--color-ink)]">
          No staff members found
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)]">
              <th className="w-12 px-5 py-4">
                <span className="sr-only">Staff</span>
              </th>
              <th className="px-4 py-4">Staff</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Last Login</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {staff.map((member) => (
              <tr
                key={member.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)]/60"
              >
                <td className="px-5 py-3.5">
                  <StaffAvatar staff={member} />
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-bold text-[var(--color-ink)]">
                    {member.fullName}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {member.phoneNumber}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <StaffRoleBadge role={roleMap.get(member.roleId)} />
                </td>
                <td className="px-4 py-3.5 text-sm text-[var(--color-ink)]">
                  {member.email}
                </td>
                <td className="px-4 py-3.5 text-xs text-[var(--color-muted)]">
                  {formatLastLogin(member.lastLoginAt)}
                </td>
                <td className="px-4 py-3.5">
                  <StaffStatus status={member.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex justify-end">
                    <StaffActions
                      staff={member}
                      onEdit={() => onEdit(member)}
                      onStatusChange={() => onStatusChange(member)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {staff.map((member) => (
          <article
            key={member.id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-3"
          >
            <div className="flex items-start gap-3">
              <StaffAvatar staff={member} />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                      {member.fullName}
                    </p>
                    <p className="mt-0.5 break-all text-xs text-[var(--color-muted)]">
                      {member.email}
                    </p>
                  </div>
                  <StaffActions
                    staff={member}
                    onEdit={() => onEdit(member)}
                    onStatusChange={() => onStatusChange(member)}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StaffRoleBadge role={roleMap.get(member.roleId)} />
                  <StaffStatus status={member.status} />
                </div>

                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Last login: {formatLastLogin(member.lastLoginAt)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
