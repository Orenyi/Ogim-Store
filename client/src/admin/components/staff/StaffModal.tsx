import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUserPlus } from "react-icons/fi";

import type {
  AdminStaff,
  CreateStaffInput,
  StaffRole,
} from "../../types/staff.types";

type Props = {
  open: boolean;
  roles: StaffRole[];
  staff?: AdminStaff | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: CreateStaffInput) => Promise<void>;
};

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

export default function StaffModal({
  open,
  roles,
  staff,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setFullName(staff?.fullName ?? "");
    setEmail(staff?.email ?? "");
    setPhoneNumber(staff?.phoneNumber ?? "");
    setRoleId(staff?.roleId ?? roles[0]?.id ?? "");
    setStatus(staff?.status ?? "active");
    setError("");
  }, [open, staff, roles]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !roleId) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        roleId,
        status,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save staff details.",
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <FiUserPlus size={19} />
                </span>
                <div>
                  <h2
                    id="staff-modal-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    {staff ? "Edit Staff" : "Add New Staff"}
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {staff
                      ? "Update this staff member's details and access."
                      : "Create a staff profile and assign a role."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-stone)] disabled:opacity-50"
              >
                <FiX size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Full name *
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter staff full name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Work email *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@ogimstore.com"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Phone number
                </label>
                <input
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="+234 800 000 0000"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Staff role *
                </label>
                <select
                  required
                  value={roleId}
                  onChange={(event) => setRoleId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-ink)]">
                  Account status
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "active" | "inactive")
                  }
                  className={fieldClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  className="h-11 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : staff
                      ? "Save Changes"
                      : "Create Staff"}
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
