import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiMail,
  FiWifi,
} from "react-icons/fi";

import FormField from "./FormField";

type FormStatus = "idle" | "loading" | "success" | "error";

type ErrorType = "validation" | "network" | null;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [emailError, setEmailError] = useState("");

  function validateEmail(value: string): string {
    const normalizedEmail = value.trim();

    if (!normalizedEmail) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return "Please enter a valid email address.";
    }

    return "";
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError("");
    setErrorType(null);

    if (status !== "loading") {
      setStatus("idle");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "loading") return;

    const validationError = validateEmail(email);
    setEmailError(validationError);
    setErrorType(validationError ? "validation" : null);
    setStatus("idle");

    if (validationError) return;

    // Frontend-only: no request is sent and no email is delivered.
    // Replace this demo response with the real API integration later.
    setStatus("success");
  }

  function simulateNetworkError() {
    // Optional development-only helper for previewing the error design.
    setStatus("error");
    setErrorType("network");
  }

  const isLoading = status === "loading";

  return (
    <div>
      <header className="mb-6 border-b border-[var(--color-border)] pb-5">
        <h2
          id="forgot-password-form-heading"
          className="text-2xl font-extrabold tracking-[-0.035em] sm:text-[28px]"
        >
          Forgot your password?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Enter your email address and we&apos;ll help you reset your password.
        </p>
      </header>

      {status === "success" ? (
        <div className="py-3 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <FiCheckCircle size={34} aria-hidden="true" />
          </div>

          <h3 className="text-xl font-extrabold sm:text-2xl">
            Check your email
          </h3>

          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Your email address{" "}
            <span className="font-semibold text-[var(--color-ink)]">
              {email.trim()}
            </span>{" "}
            passed validation.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-success-soft)] bg-[var(--color-success-soft)] p-4 text-left">
            <FiMail
              size={20}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-success)]"
            />

            <div>
              <p className="text-sm font-bold text-[var(--color-ink)]">
                Demo mode
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                Password recovery is not connected yet. No reset email has
                actually been sent.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorType(null);
              setEmailError("");
            }}
            className="mt-5 min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-4 text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            Try another email
          </button>
        </div>
      ) : (
        <>
          {status === "error" && errorType === "network" && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] p-3"
            >
              <FiWifi
                size={20}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[var(--color-error)]"
              />

              <div>
                <p className="text-sm font-bold text-[var(--color-error)]">
                  Network error
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                  Please check your internet connection and try again.
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby="forgot-password-form-heading"
            className="space-y-5"
          >
            <FormField
              id="forgot-password-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              leadingIcon={<FiMail size={18} />}
              error={emailError}
              required
              disabled={isLoading}
            />

            {errorType === "validation" && emailError && (
              <p className="flex items-start gap-2 text-xs leading-5 text-[var(--color-error)]">
                <FiAlertCircle
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                Please correct the email address above.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <FiLoader
                    size={18}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send reset link
                  <FiArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </>
      )}

      <div className="mt-5 border-t border-[var(--color-border)] pt-5 text-center">
        <Link
          to="/login"
          className="inline-flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
        >
          <span aria-hidden="true">←</span>
          Back to sign in
        </Link>
      </div>

      {import.meta.env.DEV && status !== "loading" && status !== "success" && (
        <button
          type="button"
          onClick={simulateNetworkError}
          className="mt-3 block w-full text-center text-xs text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-ink)]"
        >
          Preview network error state
        </button>
      )}
    </div>
  );
}
