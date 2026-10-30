import { useState, type FormEvent } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";

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

function normalizeNigerianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

export default function GoogleSignInButton() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = getSafeReturnTo(location.state?.from);

  const [credential, setCredential] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleGoogleSuccess(
    response: CredentialResponse,
  ): Promise<void> {
    if (!response.credential) {
      setNotice("Google sign-in failed. Please try again.");
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      const result = await signInWithGoogle(response.credential);

      if (result.onboardingRequired) {
        setCredential(response.credential);
        setFullName(result.user.fullName);
        setEmail(result.user.email);
        setOnboarding(true);
        return;
      }

      navigate(returnTo, { replace: true });
    } catch (error) {
      setNotice(
        error instanceof ApiError
          ? error.message
          : "Unable to sign in with Google. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteOnboarding(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!credential || loading) return;

    if (!acceptedTerms) {
      setNotice("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    const phone = normalizeNigerianPhone(phoneNumber);

    if (phone && !/^[789]\d{9}$/.test(phone)) {
      setNotice("Enter a valid Nigerian mobile number or leave it blank.");
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      await signInWithGoogle(
        credential,
        true,
        phone ? `234${phone}` : undefined,
      );

      navigate(returnTo, { replace: true });
    } catch (error) {
      setNotice(
        error instanceof ApiError
          ? error.message
          : "Unable to finish creating your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (onboarding) {
    return (
      <form onSubmit={handleCompleteOnboarding} className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-ink)]">
            Complete your account
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Confirm your details to finish creating your Ogim Store account.
          </p>
        </div>

        {notice && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[var(--color-error)] p-3 text-sm text-[var(--color-error)]"
          >
            <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="google-full-name"
            className="mb-1 block text-sm font-semibold"
          >
            Full name
          </label>
          <input
            id="google-full-name"
            value={fullName}
            readOnly
            className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-[var(--color-paper)] px-3 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="google-email"
            className="mb-1 block text-sm font-semibold"
          >
            Email address
          </label>
          <input
            id="google-email"
            type="email"
            value={email}
            readOnly
            className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-[var(--color-paper)] px-3 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="google-phone"
            className="mb-1 block text-sm font-semibold text-[var(--color-ink)]"
          >
            Phone number{" "}
            <span className="font-normal text-[var(--color-muted)]">
              (optional)
            </span>
          </label>
          <div className="flex gap-2">
            <span className="flex min-h-12 items-center rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-white px-3 text-sm">
              🇳🇬 +234
            </span>
            <input
              id="google-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="803 123 4567"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="min-h-12 min-w-0 flex-1 rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm leading-5 text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Complete registration"}
          {!loading && <FiArrowRight size={20} />}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setOnboarding(false);
            setCredential("");
            setNotice("");
          }}
          className="w-full py-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      {notice && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-control)] border border-[var(--color-error)] p-3 text-sm text-[var(--color-error)]"
        >
          <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      <div className={loading ? "pointer-events-none opacity-60" : ""}>
        <GoogleLogin
          onSuccess={(response) => void handleGoogleSuccess(response)}
          onError={() =>
            setNotice("Google sign-in was unsuccessful. Please try again.")
          }
          text="continue_with"
          theme="outline"
          shape="rectangular"
          size="large"
          width="320"
          logo_alignment="left"
          useOneTap={false}
        />
      </div>

      {loading && (
        <p className="text-center text-sm text-[var(--color-muted)]">
          Verifying your Google account...
        </p>
      )}
    </div>
  );
}
