import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi";

import FormField from "./FormField";
import PasswordRequirements, {
  getPasswordRequirements,
} from "./PasswordRequirements";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import GoogleSignInButton from "./GoogleSignInButton";

interface RegisterValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  acceptedTerms: boolean;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const initialValues: RegisterValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  acceptedTerms: false,
};

function normalizeNigerianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

function validateForm(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const phone = normalizeNigerianPhone(values.phoneNumber);

  if (fullName.length < 2) {
    errors.fullName = "Please enter your full name.";
  } else if (fullName.length > 100) {
    errors.fullName = "Your name must be 100 characters or fewer.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!/^[789]\d{9}$/.test(phone)) {
    errors.phoneNumber = "Enter a valid Nigerian mobile number.";
  }

  const passwordValid = getPasswordRequirements(values.password).every(
    (requirement) => requirement.valid,
  );

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (!passwordValid) {
    errors.password = "Meet all the password requirements.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = "Please accept the terms to continue.";
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

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requestedDestination: unknown = location.state?.from;
  const returnTo = getSafeReturnTo(requestedDestination);

  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  function updateField<K extends keyof RegisterValues>(
    field: K,
    value: RegisterValues[K],
  ) {
    const nextValues = { ...values, [field]: value };

    setValues(nextValues);
    setNotice("");

    if (attemptedSubmit) {
      setErrors(validateForm(nextValues));
    } else {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setAttemptedSubmit(true);
    setNotice("");

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please check the highlighted fields and try again.");
      return;
    }

    setLoading(true);

    try {
      await register(
        values.fullName.trim(),
        values.email.trim(),
        `234${normalizeNigerianPhone(values.phoneNumber)}`,
        values.password,
        values.acceptedTerms,
      );

      navigate(returnTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setNotice(
            "An account with those details may already exist. Try signing in instead.",
          );
        } else if (error.status === 429) {
          setNotice(
            "Too many registration attempts. Please wait before trying again.",
          );
        } else if (error.status === 400 && Array.isArray(error.details)) {
          const serverErrors: RegisterErrors = {};

          for (const issue of error.details) {
            if (
              typeof issue === "object" &&
              issue !== null &&
              "path" in issue &&
              "message" in issue
            ) {
              const path = (issue as { path: unknown[] }).path[0];
              const message = (issue as { message: string }).message;

              if (typeof path === "string" && path in initialValues) {
                serverErrors[path as keyof RegisterValues] = message;
              }
            }
          }

          setErrors((current) => ({ ...current, ...serverErrors }));
          setNotice(
            Object.keys(serverErrors).length
              ? "Please correct the highlighted fields."
              : error.message,
          );
        } else {
          setNotice(error.message);
        }
      } else {
        setNotice(
          "Unable to create your account right now. Check your connection and try again.",
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
          id="register-heading"
          className="text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]"
        >
          Create an account
        </h2>

        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Sign in
          </Link>
        </p>
      </header>

      {notice && (
        <div
          role="alert"
          aria-live="polite"
          className={[
            "mb-5 flex items-start gap-2 rounded-[var(--radius-control)] border p-3 text-sm leading-5",
            Object.keys(errors).length > 0
              ? "border-[var(--color-error)] bg-[var(--color-error-soft)] text-[var(--color-error)]"
              : "border-[var(--color-warning)] bg-[var(--color-warning-soft)] text-[var(--color-ink)]",
          ].join(" ")}
        >
          <FiAlertCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p>{notice}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          id="register-full-name"
          name="fullName"
          label="Full name"
          placeholder="Enter your full name"
          autoComplete="name"
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          leadingIcon={<FiUser size={18} />}
          error={errors.fullName}
          required
        />

        <FormField
          id="register-email"
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

        <div className="space-y-2">
          <label
            htmlFor="register-phone"
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            Phone number
          </label>

          <div className="flex gap-2">
            <div
              aria-label="Nigeria, country code plus 234"
              className="flex min-h-12 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm"
            >
              <span aria-hidden="true">🇳🇬</span>
              <span className="font-semibold">+234</span>
            </div>

            <input
              id="register-phone"
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="803 123 4567"
              value={values.phoneNumber}
              onChange={(event) =>
                updateField("phoneNumber", event.target.value)
              }
              aria-invalid={Boolean(errors.phoneNumber)}
              aria-describedby={
                errors.phoneNumber ? "register-phone-error" : undefined
              }
              required
              className={[
                "min-h-12 min-w-0 flex-1 rounded-[var(--radius-control)] border bg-white px-3 text-sm outline-none transition-colors",
                "focus:border-[var(--color-accent)]",
                errors.phoneNumber
                  ? "border-[var(--color-error)]"
                  : "border-[var(--color-border-strong)]",
              ].join(" ")}
            />
          </div>

          {errors.phoneNumber && (
            <p
              id="register-phone-error"
              role="alert"
              className="text-sm text-[var(--color-error)]"
            >
              {errors.phoneNumber}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <FormField
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            leadingIcon={<FiLock size={18} />}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="shrink-0 rounded-md p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
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

          <PasswordRequirements password={values.password} />
        </div>

        <div className="space-y-1">
          <label className="flex items-start gap-3 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={values.acceptedTerms}
              onChange={(event) =>
                updateField("acceptedTerms", event.target.checked)
              }
              aria-invalid={Boolean(errors.acceptedTerms)}
              aria-describedby={
                errors.acceptedTerms ? "register-terms-error" : undefined
              }
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
              required
            />

            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>

          {errors.acceptedTerms && (
            <p
              id="register-terms-error"
              role="alert"
              className="text-sm text-[var(--color-error)]"
            >
              {errors.acceptedTerms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <FiArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>

        <p className="text-xs leading-5 text-[var(--color-muted)]">
          Your account details are securely processed by Ogim Store.
        </p>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-muted)]">OR</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
      <div className="flex w-full  items-center justify-center ">
        <GoogleSignInButton />
      </div>
    </div>
  );
}
