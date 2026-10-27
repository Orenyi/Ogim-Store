import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";

import FormField from "./FormField";
import { useAuth } from "../../context/AuthContext";

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const initialValues: LoginValues = {
  email: "",
  password: "",
  rememberMe: false,
};

function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Authentication context and navigation
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Restore the intended destination after demo sign-in.
  // Only allow local application paths.
  const requestedDestination: unknown = location.state?.from;

  const returnTo =
    typeof requestedDestination === "string" &&
    requestedDestination.startsWith("/") &&
    !requestedDestination.startsWith("//") &&
    !requestedDestination.startsWith("/\\")
      ? requestedDestination
      : "/";

  function updateField<K extends keyof LoginValues>(
    field: K,
    value: LoginValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice("");

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setNotice("");

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please check your details and try again.");
      return;
    }

    // DEMO ONLY: this does not verify the password.
    // Replace with a real authentication API when the backend exists.
    login(values.email);

    navigate(returnTo, { replace: true });
  }

  return (
    <div>
      <header className="mb-6">
        <h2
          id="login-heading"
          className="text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]"
        >
          Welcome back
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Sign in to your account to continue.
        </p>
      </header>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 flex items-start gap-2 rounded-[var(--radius-control)] border border-[var(--color-warning)] bg-[var(--color-warning-soft)] p-3 text-sm leading-5 text-[var(--color-ink)]"
        >
          <FiAlertCircle
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <p>{notice}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          leadingIcon={<FiMail size={18} />}
          error={errors.email}
          required
        />

        <FormField
          id="login-password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          leadingIcon={<FiLock size={18} />}
          trailingAction={
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="rounded-md p-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            >
              {showPassword ? (
                <FiEyeOff size={18} aria-hidden="true" />
              ) : (
                <FiEye size={18} aria-hidden="true" />
              )}
            </button>
          }
          error={errors.password}
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              name="rememberMe"
              checked={values.rememberMe}
              onChange={(event) =>
                updateField("rememberMe", event.target.checked)
              }
              className="h-4 w-4 rounded accent-[var(--color-accent)]"
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <FiArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs font-medium text-[var(--color-muted)]">
          OR
        </span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <button
        type="button"
        disabled
        title="Google sign-in will be enabled when authentication is integrated"
        className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] opacity-70"
      >
        <span
          aria-hidden="true"
          className="text-lg font-extrabold text-[#4285F4]"
        >
          G
        </span>
        Continue with Google
        <span className="text-xs font-normal text-[var(--color-muted)]">
          (Coming later)
        </span>
      </button>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          state={location.state}
          className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
