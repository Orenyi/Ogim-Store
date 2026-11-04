import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

import ogimLogo from "../../../assets/images/ogim_logo.webp";

import type { AdminLoginCredentials } from "../../types/auth.types";

export type { AdminLoginCredentials } from "../../types/auth.types";

type AdminLoginFormProps = {
  onSubmit: (credentials: AdminLoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string | null;
};

export default function AdminLoginForm({
  onSubmit,
  loading = false,
  error,
}: AdminLoginFormProps) {
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setValidationError("Please enter your work email and password.");
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!emailIsValid) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    await onSubmit({
      email: normalizedEmail,
      password,
      rememberMe,
    });
  }

  const formError = validationError || error;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[440px]"
    >
      {/* Mobile logo */}
      <div className="mb-7 flex justify-center ">
        <img
          src={ogimLogo}
          alt="Ogim Store"
          className="h-10 w-auto object-cover lg:h-16"
        />
      </div>

      {/* Admin portal label */}
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]">
          <FiShield size={14} />
          Admin Portal
        </span>

        <h1 className="mt-5 font-heading text-2xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-3xl">
          Sign in to your account
        </h1>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
          Access the Ogim Store admin dashboard to manage orders, inventory and
          fulfilment.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-semibold text-[var(--color-ink)]"
          >
            Email address
          </label>

          <div className="relative">
            <FiMail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />

            <input
              id="admin-email"
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
              className="h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-11 pr-4 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/80 hover:border-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-semibold text-[var(--color-ink)]"
          >
            Password
          </label>

          <div className="relative">
            <FiLock
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />

            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
              className="h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-11 pr-12 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/80 hover:border-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me and forgot password */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              disabled={loading}
              className="h-4 w-4 cursor-pointer rounded border-[var(--color-border-strong)] accent-[var(--color-accent)]"
            />
            Remember me
          </label>

          <Link
            to="/admin/forgot-password"
            className="text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error message */}
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3"
          >
            <FiAlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-[var(--color-error)]"
            />

            <p className="text-xs leading-5 text-[var(--color-error)]">
              {formError}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <FiLoader size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <FiArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 border-t border-[var(--color-border)] pt-5 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-muted)]">
          <FiShield size={13} />
          <span>Secure access for authorised Ogim Store staff only.</span>
        </div>
      </div>
    </motion.section>
  );
}
