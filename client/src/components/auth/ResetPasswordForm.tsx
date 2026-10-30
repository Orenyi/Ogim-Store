import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
  FiShield,
} from "react-icons/fi";

import FormField from "./FormField";
import PasswordRequirements, {
  getPasswordRequirements,
} from "./PasswordRequirements";

import { ApiError, resetPassword } from "../../lib/api";

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const initialValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

function validateForm(values: ResetPasswordValues): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};

  const requirements = getPasswordRequirements(values.password);

  const passwordIsValid = requirements.every(
    (requirement) => requirement.valid,
  );

  if (!values.password) {
    errors.password = "New password is required.";
  } else if (values.password.length > 128) {
    errors.password = "Password cannot exceed 128 characters.";
  } else if (!passwordIsValid) {
    errors.password = "Your password does not meet all the requirements.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Your passwords do not match.";
  }

  return errors;
}

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() ?? "";

  const [values, setValues] = useState<ResetPasswordValues>(initialValues);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [notice, setNotice] = useState("");

  const isLoading = status === "loading";

  const passwordsMatch =
    values.confirmPassword.length > 0 &&
    values.password === values.confirmPassword;

  function updateField<K extends keyof ResetPasswordValues>(
    field: K,
    value: ResetPasswordValues[K],
  ) {
    const nextValues = {
      ...values,
      [field]: value,
    };

    setValues(nextValues);
    setNotice("");

    if (status === "error") {
      setStatus("idle");
    }

    if (attemptedSubmit) {
      setErrors(validateForm(nextValues));
    } else {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
        ...(field === "password" ? { confirmPassword: undefined } : {}),
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setAttemptedSubmit(true);
    setNotice("");

    if (!token || token.length < 32 || token.length > 256) {
      setStatus("error");
      setNotice(
        "This password reset link is missing or invalid. Please request a new reset link.",
      );
      return;
    }

    const nextErrors = validateForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setNotice("Please correct the highlighted fields.");
      return;
    }

    setStatus("loading");

    try {
      await resetPassword({
        token,
        password: values.password,
      });

      setStatus("success");
      setNotice("");
      setValues(initialValues);
    } catch (error) {
      setStatus("error");

      if (error instanceof ApiError) {
        if (error.status === 400) {
          setNotice(
            error.message ||
              "This password reset link is invalid or has expired. Please request a new one.",
          );
        } else if (error.status === 429) {
          setNotice("Too many attempts. Please wait a little and try again.");
        } else {
          setNotice(error.message);
        }
      } else {
        setNotice(
          "Unable to connect to the server. Please check your connection and try again.",
        );
      }
    }
  }

  // Missing or malformed reset token
  if (!token || token.length < 32 || token.length > 256) {
    return (
      <div>
        <header className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]">
            Invalid reset link
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            This password reset link is missing or invalid.
          </p>
        </header>

        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] p-4"
        >
          <FiAlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-[var(--color-error)]"
            aria-hidden="true"
          />

          <p className="text-sm leading-6 text-[var(--color-muted)]">
            Please request a new password reset link to continue.
          </p>
        </div>

        <Link
          to="/forgot-password"
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Request a new reset link
          <FiArrowRight size={18} aria-hidden="true" />
        </Link>

        <div className="mt-5 border-t border-[var(--color-border)] pt-5 text-center">
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            <FiArrowLeft size={16} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // Successful password reset
  if (status === "success") {
    return (
      <div className="py-3 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
          <FiCheckCircle size={34} aria-hidden="true" />
        </div>

        <h2 className="text-2xl font-extrabold tracking-[-0.035em]">
          Password updated!
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          Your password has been changed successfully. You can now sign in using
          your new password.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] p-4 text-left">
          <FiShield
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[var(--color-success)]"
          />

          <div>
            <p className="text-sm font-bold text-[var(--color-ink)]">
              Your account is secure
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
              Your previous sessions have been revoked. Sign in again with your
              new password.
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Continue to sign in
          <FiArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h2
          id="reset-password-heading"
          className="text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]"
        >
          Create a new password
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Choose a strong password for your account.
        </p>
      </header>

      <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] p-3">
        <FiShield
          size={19}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-[var(--color-success)]"
        />

        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Keep your account secure
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
            Use a unique password that you don't use on other websites.
          </p>
        </div>
      </div>

      {notice && (
        <div
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mb-5 flex items-start gap-2 rounded-[var(--radius-control)] border p-3 text-sm leading-5 ${
            status === "error"
              ? "border-[var(--color-error-soft)] bg-[var(--color-error-soft)] text-[var(--color-error)]"
              : "border-[var(--color-warning)] bg-[var(--color-warning-soft)] text-[var(--color-ink)]"
          }`}
        >
          <FiAlertCircle
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />

          <p>{notice}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="reset-password-heading"
        className="space-y-5"
      >
        <div className="space-y-3">
          <FormField
            id="reset-new-password"
            name="password"
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your new password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            leadingIcon={<FiLock size={18} />}
            trailingAction={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Hide new password" : "Show new password"
                }
                aria-pressed={showPassword}
                className="rounded-md p-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
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
            disabled={isLoading}
          />

          <PasswordRequirements password={values.password} />
        </div>

        <FormField
          id="reset-confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) =>
            updateField("confirmPassword", event.target.value)
          }
          leadingIcon={<FiLock size={18} />}
          trailingAction={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              aria-pressed={showConfirmPassword}
              className="rounded-md p-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={18} aria-hidden="true" />
              ) : (
                <FiEye size={18} aria-hidden="true" />
              )}
            </button>
          }
          error={errors.confirmPassword}
          required
          disabled={isLoading}
        />

        {values.confirmPassword.length > 0 && !errors.confirmPassword && (
          <p className="text-xs font-medium text-[var(--color-success)]">
            {passwordsMatch
              ? "Your passwords match."
              : "Your passwords do not match."}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <FiLoader size={18} className="animate-spin" aria-hidden="true" />
              Updating password...
            </>
          ) : (
            <>
              Reset password
              <FiArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 border-t border-[var(--color-border)] pt-5 text-center">
        <Link
          to="/login"
          className="inline-flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
        >
          <FiArrowLeft size={16} aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
