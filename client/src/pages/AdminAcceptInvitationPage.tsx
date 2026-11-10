import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiAlertCircle,
  FiClock,
  FiLoader,
} from "react-icons/fi";

import {
  apiRequest,
  type ValidateAdminInvitationResponse,
  type AcceptAdminInvitationResponse,
} from "../lib/api";

// ============================================
// TYPES
// ============================================

type PageStatus =
  | "validating"
  | "ready"
  | "expired"
  | "invalid"
  | "submitting"
  | "success";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

// ============================================
// PASSWORD REQUIREMENTS
// Keep these aligned with backend passwordSchema.
// ============================================

const passwordRequirements = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "No more than 128 characters",
    test: (value: string) => value.length <= 128,
  },
  {
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
  {
    label: "One special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

// ============================================
// HELPERS
// ============================================

function formatExpiryDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getPasswordStrength(password: string) {
  if (!password) {
    return {
      score: 0,
      label: "",
      width: "0%",
    };
  }

  const score = passwordRequirements.filter((requirement) =>
    requirement.test(password),
  ).length;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];

  return {
    score,
    label: labels[score - 1] || "Very weak",
    width: `${(score / passwordRequirements.length) * 100}%`,
  };
}

// ============================================
// PAGE
// ============================================

export default function AdminAcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() ?? "";

  const [status, setStatus] = useState<PageStatus>("validating");

  const [invitation, setInvitation] = useState<
    ValidateAdminInvitationResponse["data"] | null
  >(null);

  const [pageError, setPageError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const passwordStrength = getPasswordStrength(password);

  const passwordChecks = passwordRequirements.map((requirement) => ({
    ...requirement,
    passed: requirement.test(password),
  }));

  // ============================================
  // VALIDATE INVITATION TOKEN
  // ============================================

  useEffect(() => {
    let isMounted = true;

    async function validateInvitation() {
      if (!token) {
        setPageError(
          "This invitation link is missing its security token. Please use the complete link from your invitation email.",
        );
        setStatus("invalid");
        return;
      }

      setStatus("validating");
      setPageError("");

      try {
        const response = await apiRequest<ValidateAdminInvitationResponse>(
          "/admin/invitations/validate",
          {
            method: "POST",
            body: JSON.stringify({ token }),
          },
        );

        if (!isMounted) return;

        const details = response.data;

        if (!details?.email || !details?.fullName || !details?.role) {
          throw new Error(
            "The invitation response is incomplete. Please request a new invitation.",
          );
        }

        const expiryTime = new Date(details.expiresAt).getTime();

        if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) {
          setInvitation(details);
          setStatus("expired");
          return;
        }

        setInvitation(details);
        setStatus("ready");
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "Unable to validate this invitation.";

        setPageError(message);

        if (/expired/i.test(message)) {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      }
    }

    void validateInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // ============================================
  // FORM VALIDATION
  // ============================================

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (password.length < 8) {
      errors.password = "Your password must contain at least 8 characters.";
    } else if (password.length > 128) {
      errors.password = "Your password must be 128 characters or fewer.";
    } else if (!/[a-z]/.test(password)) {
      errors.password =
        "Include at least one lowercase letter in your password.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password =
        "Include at least one uppercase letter in your password.";
    } else if (!/\d/.test(password)) {
      errors.password = "Include at least one number in your password.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password =
        "Include at least one special character in your password.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Your passwords do not match.";
    }

    if (!acceptedTerms) {
      errors.terms = "You must accept the terms to continue.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  // ============================================
  // ACCEPT INVITATION
  // ============================================

  async function handleAcceptInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "ready" || !invitation) return;

    if (!validateForm()) return;

    setStatus("submitting");
    setPageError("");

    try {
      await apiRequest<AcceptAdminInvitationResponse>(
        "/admin/invitations/accept",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            password,
            acceptedTerms: true,
          }),
        },
      );

      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't complete your invitation.";

      setPageError(message);

      if (/expired/i.test(message)) {
        setStatus("expired");
      } else {
        setStatus("ready");
      }
    }
  }

  // ============================================
  // SHARED STYLES
  // ============================================

  const inputClass = (hasError: boolean) =>
    `h-12 w-full rounded-xl border bg-[var(--color-white)] pl-11 pr-12 text-sm text-[var(--color-ink)] outline-none transition focus:ring-4 ${
      hasError
        ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10"
        : "border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/10"
    }`;

  // ============================================
  // RENDER
  // ============================================

  return (
    <main className="relative flex min-h-screen  items-center justify-center overflow-hidden bg-[var(--color-paper)] px-4 py-10 sm:px-6 lg:py-14">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[var(--color-accent)]/[0.06] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--color-accent)]/[0.05] blur-3xl"
      />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2"
            aria-label="Ogim Store home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-lg font-extrabold text-white shadow-[var(--shadow-sm)]">
              O
            </span>

            <span className="font-heading text-2xl font-extrabold tracking-[-0.06em] text-[var(--color-ink)]">
              ogim<span className="text-[var(--color-accent)]">.</span>
            </span>
          </Link>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Staff account activation
          </p>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-dropdown)]"
        >
          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait">
              {/* -------------------------------- */}
              {/* VALIDATING */}
              {/* -------------------------------- */}

              {status === "validating" && (
                <motion.div
                  key="validating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <FiLoader size={25} className="animate-spin" />
                  </div>

                  <h1 className="mt-5 text-xl font-extrabold sm:text-2xl">
                    Verifying your invitation
                  </h1>

                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Please wait while we securely validate your invitation link.
                  </p>
                </motion.div>
              )}

              {/* -------------------------------- */}
              {/* INVALID / EXPIRED */}
              {/* -------------------------------- */}

              {(status === "invalid" || status === "expired") && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-5 text-center"
                >
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                      status === "expired"
                        ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
                        : "bg-[var(--color-error-soft)] text-[var(--color-error)]"
                    }`}
                  >
                    {status === "expired" ? (
                      <FiClock size={28} />
                    ) : (
                      <FiAlertCircle size={28} />
                    )}
                  </div>

                  <h1 className="mt-5 text-xl font-extrabold sm:text-2xl">
                    {status === "expired"
                      ? "Invitation expired"
                      : "Invalid invitation"}
                  </h1>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                    {pageError ||
                      (status === "expired"
                        ? "This invitation is no longer valid. Please contact your administrator for a new invitation."
                        : "We couldn't verify this invitation. Please check that you are using the complete email link.")}
                  </p>

                  <div className="mt-7 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4 text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                      What should I do?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                      Contact the administrator who invited you and request a
                      new invitation email. Previous or expired invitation links
                      cannot be reused.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* -------------------------------- */}
              {/* ACCEPTANCE FORM */}
              {/* -------------------------------- */}

              {(status === "ready" || status === "submitting") &&
                invitation && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <FiShield size={23} />
                      </div>

                      <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.045em] sm:text-[28px]">
                        Complete your invitation
                      </h1>

                      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                        You've been invited to join the Ogim Store
                        administration team. Set your password to activate your
                        account.
                      </p>
                    </div>

                    {/* Invitation details */}
                    <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                          Your invitation
                        </span>

                        <span className="rounded-full bg-[var(--color-success-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-success)]">
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          <FiUser size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                            {invitation.fullName}
                          </p>

                          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
                            <FiMail size={12} className="shrink-0" />
                            <span className="truncate">{invitation.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                            Assigned role
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-[var(--color-ink)]">
                            {invitation.role.name}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                            Invitation expires
                          </p>

                          <p className="mt-1 text-xs font-semibold text-[var(--color-ink)]">
                            {formatExpiryDate(invitation.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {pageError && (
                      <div
                        role="alert"
                        className="mb-5 flex items-start gap-2 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-3.5 py-3 text-xs leading-5 text-[var(--color-error)]"
                      >
                        <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{pageError}</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleAcceptInvitation}
                      className="space-y-5"
                      noValidate
                    >
                      {/* Password */}
                      <div>
                        <label
                          htmlFor="invitation-password"
                          className="mb-2 block text-sm font-semibold text-[var(--color-ink)]"
                        >
                          Create password
                        </label>

                        <div className="relative">
                          <FiLock
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                          />

                          <input
                            id="invitation-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={password}
                            maxLength={128}
                            onChange={(event) => {
                              setPassword(event.target.value);
                              setFormErrors((current) => ({
                                ...current,
                                password: undefined,
                              }));
                            }}
                            placeholder="Enter a secure password"
                            disabled={status === "submitting"}
                            className={inputClass(Boolean(formErrors.password))}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
                          >
                            {showPassword ? (
                              <FiEyeOff size={18} />
                            ) : (
                              <FiEye size={18} />
                            )}
                          </button>
                        </div>

                        {formErrors.password && (
                          <p className="mt-1.5 text-xs text-[var(--color-error)]">
                            {formErrors.password}
                          </p>
                        )}

                        {/* Password strength */}
                        {password && (
                          <div className="mt-3">
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-[11px] text-[var(--color-muted)]">
                                Password strength
                              </span>

                              <span className="text-[11px] font-bold text-[var(--color-ink)]">
                                {passwordStrength.label}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-stone)]">
                              <div
                                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
                                style={{
                                  width: passwordStrength.width,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Live password requirements */}
                        <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3.5">
                          <p className="mb-3 text-xs font-bold text-[var(--color-ink)]">
                            Password must contain:
                          </p>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {passwordChecks.map((requirement) => (
                              <div
                                key={requirement.label}
                                className="flex items-center gap-2"
                              >
                                <span
                                  className={
                                    requirement.passed
                                      ? "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[10px] text-[var(--color-success)]"
                                      : "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-stone)] text-[10px] text-[var(--color-muted)]"
                                  }
                                >
                                  {requirement.passed ? (
                                    <FiCheck />
                                  ) : (
                                    <FiClock />
                                  )}
                                </span>

                                <span
                                  className={`text-xs ${
                                    requirement.passed
                                      ? "text-[var(--color-success)]"
                                      : "text-[var(--color-muted)]"
                                  }`}
                                >
                                  {requirement.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label
                          htmlFor="invitation-confirm-password"
                          className="mb-2 block text-sm font-semibold text-[var(--color-ink)]"
                        >
                          Confirm password
                        </label>

                        <div className="relative">
                          <FiLock
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                          />

                          <input
                            id="invitation-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={confirmPassword}
                            maxLength={128}
                            onChange={(event) => {
                              setConfirmPassword(event.target.value);
                              setFormErrors((current) => ({
                                ...current,
                                confirmPassword: undefined,
                              }));
                            }}
                            placeholder="Enter your password again"
                            disabled={status === "submitting"}
                            className={inputClass(
                              Boolean(formErrors.confirmPassword),
                            )}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((value) => !value)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
                          >
                            {showConfirmPassword ? (
                              <FiEyeOff size={18} />
                            ) : (
                              <FiEye size={18} />
                            )}
                          </button>
                        </div>

                        {formErrors.confirmPassword && (
                          <p className="mt-1.5 text-xs text-[var(--color-error)]">
                            {formErrors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Terms */}
                      <div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] p-3.5 transition hover:border-[var(--color-accent)]">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(event) => {
                              setAcceptedTerms(event.target.checked);
                              setFormErrors((current) => ({
                                ...current,
                                terms: undefined,
                              }));
                            }}
                            disabled={status === "submitting"}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                          />

                          <span className="text-xs leading-5 text-[var(--color-muted)]">
                            I accept the Ogim Store{" "}
                            <Link
                              to="/terms"
                              target="_blank"
                              className="font-bold text-[var(--color-accent)] underline underline-offset-2"
                            >
                              Terms and Conditions
                            </Link>{" "}
                            and agree to follow the store's administrative
                            policies and responsibilities.
                          </span>
                        </label>

                        {formErrors.terms && (
                          <p className="mt-1.5 text-xs text-[var(--color-error)]">
                            {formErrors.terms}
                          </p>
                        )}
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-bold text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status === "submitting" ? (
                          <>
                            <FiLoader className="animate-spin" size={17} />
                            Activating your account...
                          </>
                        ) : (
                          <>
                            Accept invitation
                            <FiArrowRight size={17} />
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] leading-5 text-[var(--color-muted)]">
                        This invitation is for{" "}
                        <strong className="text-[var(--color-ink)]">
                          {invitation.email}
                        </strong>
                        . It can only be accepted once.
                      </p>
                    </form>
                  </motion.div>
                )}

              {/* -------------------------------- */}
              {/* SUCCESS */}
              {/* -------------------------------- */}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-5 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
                    <FiCheckCircle size={31} />
                  </div>

                  <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.04em]">
                    You're officially on board!
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    Your Ogim Store staff account has been successfully
                    activated. You can now sign in to the administration portal
                    using your email and new password.
                  </p>

                  {invitation && (
                    <div className="mt-6 rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] p-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-success)]">
                        <FiCheck size={16} />
                        Account activated
                      </div>

                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {invitation.fullName}
                      </p>

                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {invitation.email}
                      </p>

                      <p className="mt-2 text-xs text-[var(--color-muted)]">
                        Assigned role:{" "}
                        <strong className="text-[var(--color-ink)]">
                          {invitation.role.name}
                        </strong>
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
                  >
                    Continue to admin login
                    <FiArrowRight size={17} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--color-muted)]">
            Secure staff onboarding · Ogim Store
          </p>

          <p className="mt-2 text-[11px] text-[var(--color-muted)]">
            Need help? Contact the administrator who invited you.
          </p>
        </div>
      </div>
    </main>
  );
}
