import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUserPlus, FiMail, FiShield } from "react-icons/fi";
import { createPortal } from "react-dom";

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
  "mt-2 h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

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
  const [error, setError] = useState("");

  const isEditing = Boolean(staff);

  // The protected Administrator role must never be assigned to staff.
  const assignableRoles = roles.filter((role) => role.key !== "administrator");

  useEffect(() => {
    if (!open) return;

    setFullName(staff?.fullName ?? "");
    setEmail(staff?.email ?? "");
    setPhoneNumber(staff?.phoneNumber ?? "");
    setRoleId(staff?.roleId ?? assignableRoles[0]?.id ?? "");
    setError("");
  }, [open, staff, roles]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!roleId) {
      setError("Please select a staff role.");
      return;
    }

    if (isEditing) {
      try {
        await onSubmit({
          fullName: staff?.fullName ?? "",
          email: staff?.email ?? "",
          phoneNumber: staff?.phoneNumber ?? "",
          roleId,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update the staff role.",
        );
      }

      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        roleId,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the staff invitation.",
      );
    }
  }

  if (assignableRoles.length === 0 && !isEditing) {
    // The modal still renders so the user can see why an invitation
    // cannot currently be created.
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
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
            aria-labelledby="staff-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "var(--color-muted) transparent",
            }}
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  {isEditing ? (
                    <FiShield size={19} />
                  ) : (
                    <FiUserPlus size={19} />
                  )}
                </span>

                <div>
                  <h2
                    id="staff-modal-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    {isEditing ? "Update Staff Role" : "Invite New Staff"}
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {isEditing
                      ? "Change this staff member's assigned access role."
                      : "Send an invitation to join the Ogim Store admin team."}
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
              {!isEditing && (
                <>
                  {/* Full name */}
                  <div>
                    <label
                      htmlFor="staff-full-name"
                      className="text-xs font-semibold text-[var(--color-ink)]"
                    >
                      Full name *
                    </label>

                    <input
                      id="staff-full-name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter staff full name"
                      autoComplete="name"
                      className={fieldClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="staff-email"
                      className="text-xs font-semibold text-[var(--color-ink)]"
                    >
                      Work email *
                    </label>

                    <input
                      id="staff-email"
                      required
                      type="email"
                      maxLength={254}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@ogimstore.com"
                      autoComplete="email"
                      className={fieldClass}
                    />
                  </div>

                  {/* Phone number */}
                  <div>
                    <label
                      htmlFor="staff-phone"
                      className="text-xs font-semibold text-[var(--color-ink)]"
                    >
                      Phone number
                    </label>

                    <input
                      id="staff-phone"
                      type="tel"
                      maxLength={30}
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="+234 800 000 0000"
                      autoComplete="tel"
                      className={fieldClass}
                    />
                  </div>
                </>
              )}

              {/* Existing staff information */}
              {isEditing && staff && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-bold text-[var(--color-accent)]">
                      {staff.initials}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                        {staff.fullName}
                      </p>

                      <p className="truncate text-xs text-[var(--color-muted)]">
                        {staff.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role */}
              <div>
                <label
                  htmlFor="staff-role"
                  className="text-xs font-semibold text-[var(--color-ink)]"
                >
                  Staff role *
                </label>

                <select
                  id="staff-role"
                  required
                  value={roleId}
                  onChange={(event) => setRoleId(event.target.value)}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Select a role
                  </option>

                  {assignableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {assignableRoles.length === 0 && (
                  <p className="mt-2 text-xs text-[var(--color-error)]">
                    No assignable staff roles are available. Create or check a
                    staff role before continuing.
                  </p>
                )}
              </div>

              {/* Invitation information */}
              {!isEditing && (
                <div className="flex gap-3 rounded-xl border border-[var(--color-accent)]/15 bg-[var(--color-accent-soft)] p-3">
                  <FiMail
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                  />

                  <div>
                    <p className="text-xs font-bold text-[var(--color-ink)]">
                      Invitation email
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                      The staff member will receive an email containing a secure
                      invitation link. The link expires after 24 hours. Their
                      admin account will only be created after they set their
                      password and accept the invitation.
                    </p>
                  </div>
                </div>
              )}

              {isEditing && (
                <p className="text-xs leading-5 text-[var(--color-muted)]">
                  Personal information and account status are managed
                  separately. This action only changes the assigned role.
                </p>
              )}

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[var(--color-error-soft)] px-3 py-2.5 text-xs text-[var(--color-error)]"
                >
                  {error}
                </p>
              )}

              {/* Actions */}
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
                  disabled={
                    saving ||
                    !roleId ||
                    (!isEditing && assignableRoles.length === 0)
                  }
                  className="h-11 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? isEditing
                      ? "Updating..."
                      : "Sending invitation..."
                    : isEditing
                      ? "Update Role"
                      : "Send Invitation"}
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
