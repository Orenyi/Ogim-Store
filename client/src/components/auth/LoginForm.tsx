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
import { ApiError } from "../../lib/api";
import GoogleSignInButton from "./GoogleSignInButton";

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

function getSafeReturnTo(destination: unknown): string {
  if (
    typeof destination === "string" &&
    destination.startsWith("/") &&
    !destination.startsWith("//") &&
    !destination.startsWith("/\\") &&
    !destination.includes("\\")
  ) {
    return destination;
  }

  return "/";
}

export default function LoginForm() {
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requestedDestination: unknown = location.state?.from;
  const returnTo = getSafeReturnTo(requestedDestination);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setNotice("");

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please check your details and try again.");
      return;
    }

    setLoading(true);

    try {
      await login(values.email.trim(), values.password, values.rememberMe);

      navigate(returnTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setNotice(
            "Too many sign-in attempts. Please wait a while before trying again.",
          );
        } else if (error.status === 401) {
          setNotice("Invalid email or password.");
        } else if (error.status === 403) {
          setNotice(
            "Your session could not be verified. Refresh the page and try again.",
          );
        } else {
          setNotice(error.message);
        }
      } else {
        setNotice(
          "Unable to sign in right now. Check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
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
          role="alert"
          aria-live="polite"
          className="mb-5 flex items-start gap-2 rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-[var(--color-paper)] p-3 text-sm leading-5 text-[var(--color-ink)]"
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
            className="text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-ink)]"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
        <span className="h-px flex-1 bg-[var(--color-stone)]" />
        <span className="text-xs font-medium text-[var(--color-muted)]">
          OR
        </span>
        <span className="h-px flex-1 bg-[var(--color-stone)]" />
      </div>

      <div className="flex w-full  items-center justify-center ">
        <GoogleSignInButton />
      </div>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          state={location.state}
          className="font-semibold text-[var(--color-accent)] hover:opacity-80"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
