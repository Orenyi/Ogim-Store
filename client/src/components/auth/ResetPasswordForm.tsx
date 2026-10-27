import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
} from "react-icons/fi";

import FormField from "./FormField";
import PasswordRequirements, {
  getPasswordRequirements,
} from "./PasswordRequirements";

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
}

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
  const [values, setValues] = useState<ResetPasswordValues>(initialValues);

  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [notice, setNotice] = useState("");

  //   const requirements = getPasswordRequirements(values.password);

  //   const passwordIsValid =
  //     values.password.length > 0 &&
  //     requirements.every((requirement) => requirement.valid);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAttemptedSubmit(true);
    setNotice("");

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please correct the highlighted fields.");
      return;
    }

    // Frontend-only: no reset token is verified and no password is saved.
    setNotice(
      "Your password details are valid. Password resetting will be available when the backend is connected.",
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
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Reset password
          <FiArrowRight size={18} aria-hidden="true" />
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

      <p className="mt-4 text-center text-xs leading-5 text-[var(--color-muted)]">
        Password changes are not saved until password recovery is connected to
        the backend.
      </p>
    </div>
  );
}
