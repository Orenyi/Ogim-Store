import { useState } from "react";

import AdminLoginForm, {
  type AdminLoginCredentials,
} from "../admin/auth/AdminLoginForm";

import AdminLoginVisual from "../admin/auth/AdminLoginVisual";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(credentials: AdminLoginCredentials) {
    setLoading(true);
    setError(null);

    try {
      /*
       * ADMIN AUTHENTICATION INTEGRATION POINT
       *
       * We will connect this to adminAuth.service.ts when
       * the admin authentication backend is implemented.
       *
       * Do not simulate a successful login or store credentials
       * in localStorage.
       */
      console.info("Admin login form ready for API integration.", {
        email: credentials.email,
        rememberMe: credentials.rememberMe,
      });

      setError(
        "Admin authentication is not connected yet. The login API will be integrated in the next step.",
      );
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen  items-center justify-center overflow-hidden bg-[var(--color-paper)] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[var(--color-accent-soft)]/70 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-32 h-96 w-96 rounded-full bg-[var(--color-stone)]/60 blur-3xl"
      />

      {/* Login container */}
      <div className="relative z-10 grid w-full max-w-[1180px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] lg:min-h-[650px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Product visual — hidden below large screens */}
        <AdminLoginVisual />

        {/* Form area */}
        <section className="flex min-w-0 items-center justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-10 xl:px-14">
          <AdminLoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
        </section>
      </div>
    </main>
  );
}
