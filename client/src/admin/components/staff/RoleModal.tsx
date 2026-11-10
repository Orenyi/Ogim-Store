import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiShield, FiX, FiLock } from "react-icons/fi";

import {
  STAFF_PERMISSION_GROUPS,
  type CreateRoleInput,
  type StaffPermission,
  type StaffRole,
} from "../../types/staff.types";

type Props = {
  open: boolean;
  role?: StaffRole | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRoleInput) => Promise<void>;
};

const colors: StaffRole["color"][] = [
  "orange",
  "blue",
  "purple",
  "green",
  "yellow",
];

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]";

export default function RoleModal({
  open,
  role,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<StaffRole["color"]>("orange");
  const [permissions, setPermissions] = useState<StaffPermission[]>([]);
  const [error, setError] = useState("");

  const isEditing = Boolean(role);
  const isProtectedRole = role?.key === "administrator";

  useEffect(() => {
    if (!open) return;

    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setColor(role?.color ?? "orange");
    setPermissions(role ? [...role.permissions] : []);
    setError("");
  }, [open, role]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  function togglePermission(permission: StaffPermission) {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }

  function toggleGroup(groupPermissions: StaffPermission[]) {
    const allSelected = groupPermissions.every((item) =>
      permissions.includes(item),
    );

    setPermissions((current) =>
      allSelected
        ? current.filter((item) => !groupPermissions.includes(item))
        : [...new Set([...current, ...groupPermissions])],
    );
  }

  function selectAllPermissions() {
    setPermissions(
      STAFF_PERMISSION_GROUPS.flatMap((group) =>
        group.permissions.map((item) => item.key),
      ),
    );
  }

  function clearAllPermissions() {
    setPermissions([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isProtectedRole) {
      setError("The Administrator system role cannot be modified.");
      return;
    }

    if (!name.trim()) {
      setError("Enter a role name.");
      return;
    }

    if (!permissions.length) {
      setError("Select at least one permission.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        color,
        permissions,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save this role.",
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              onClose();
            }
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <FiShield size={19} />
                </span>

                <div>
                  <h2
                    id="role-modal-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    {isProtectedRole
                      ? "Protected System Role"
                      : isEditing
                        ? "Manage Role"
                        : "Create Role"}
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {isProtectedRole
                      ? "This system role cannot be modified."
                      : "Define the pages and actions this role can access."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close role modal"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-stone)] disabled:opacity-50"
              >
                <FiX size={19} />
              </button>
            </div>

            {isProtectedRole ? (
              <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                  <FiLock size={16} />
                  Administrator role is protected
                </div>

                <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                  The Administrator role has unrestricted administrative
                  permissions and cannot be edited through role management.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 h-10 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-ink)]">
                      Role name *
                    </label>

                    <input
                      required
                      maxLength={60}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Customer Support"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--color-ink)]">
                      Role colour
                    </label>

                    <select
                      value={color}
                      onChange={(event) =>
                        setColor(event.target.value as StaffRole["color"])
                      }
                      className={fieldClass}
                    >
                      {colors.map((item) => (
                        <option key={item} value={item}>
                          {item[0].toUpperCase() + item.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--color-ink)]">
                    Description
                  </label>

                  <textarea
                    rows={2}
                    maxLength={250}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Briefly describe what this role is responsible for."
                    className="mt-2 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-ink)]">
                        Permissions
                      </h3>

                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {permissions.length} permissions selected
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      >
                        Clear all
                      </button>

                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                      >
                        Select all
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {STAFF_PERMISSION_GROUPS.map((group) => {
                      const groupKeys = group.permissions.map(
                        (item) => item.key,
                      );

                      const allSelected = groupKeys.every((key) =>
                        permissions.includes(key),
                      );

                      const someSelected = groupKeys.some((key) =>
                        permissions.includes(key),
                      );

                      return (
                        <section
                          key={group.label}
                          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-3"
                        >
                          <label className="flex cursor-pointer items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2.5">
                            <span className="text-xs font-bold text-[var(--color-ink)]">
                              {group.label}
                            </span>

                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(element) => {
                                if (element) {
                                  element.indeterminate =
                                    someSelected && !allSelected;
                                }
                              }}
                              onChange={() => toggleGroup(groupKeys)}
                              className="h-4 w-4 accent-[var(--color-accent)]"
                              aria-label={`Select all ${group.label} permissions`}
                            />
                          </label>

                          <div className="mt-2.5 space-y-2.5">
                            {group.permissions.map((permission) => (
                              <label
                                key={permission.key}
                                className="flex cursor-pointer items-center gap-2.5 text-xs text-[var(--color-muted)]"
                              >
                                <input
                                  type="checkbox"
                                  checked={permissions.includes(permission.key)}
                                  onChange={() =>
                                    togglePermission(permission.key)
                                  }
                                  className="h-4 w-4 rounded accent-[var(--color-accent)]"
                                />

                                {permission.label}
                              </label>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-[var(--color-error-soft)] px-3 py-2.5 text-xs text-[var(--color-error)]"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="h-11 rounded-xl border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : isEditing
                        ? "Save Permissions"
                        : "Create Role"}
                  </button>
                </div>
              </form>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
