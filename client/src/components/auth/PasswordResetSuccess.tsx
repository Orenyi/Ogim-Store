import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";

export default function PasswordResetSuccess() {
  return (
    <section
      aria-labelledby="password-reset-success-heading"
      className="py-3 text-center sm:py-5"
    >
      {/* Success icon */}
      <div
        aria-hidden="true"
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-soft)] sm:h-20 sm:w-20"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success)] text-white sm:h-12 sm:w-12">
          <FiCheck size={27} strokeWidth={3} />
        </span>
      </div>

      <h2
        id="password-reset-success-heading"
        className="text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]"
      >
        Password reset complete
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
        This is a preview of the password-reset success screen. Once password
        recovery is connected, customers will see confirmation here after their
        password has been changed successfully.
      </p>

      <div className="mt-6 rounded-[var(--radius-control)] border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] p-3 text-left">
        <p className="text-sm font-semibold text-[var(--color-success)]">
          Password recovery preview
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
          No password has been changed yet because the backend is not connected.
        </p>
      </div>

      <Link
        to="/login"
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        Sign in to your account
        <FiArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}
