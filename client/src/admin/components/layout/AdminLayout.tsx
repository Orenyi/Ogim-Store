import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminMobileNav from "./AdminMobileNav";
import AdminMobileMenu from "./AdminMobileMenu";

import { ApiError, getAdminSession, type AdminUser } from "../../../lib/api";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const navigate = useNavigate();

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Verify the admin session when the layout first mounts.
  // Normal navigation between admin pages will not trigger this again.
  useEffect(() => {
    let isMounted = true;

    async function verifyAdminSession() {
      setSessionReady(false);
      setSessionError(null);

      try {
        const response = await getAdminSession();

        if (!isMounted) return;

        if (!response.user || response.user.role !== "admin") {
          navigate("/admin/login", { replace: true });
          return;
        }

        setAdmin(response.user);
      } catch (error) {
        if (!isMounted) return;

        setAdmin(null);

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          navigate("/admin/login", { replace: true });
          return;
        }

        setSessionError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the server. Please try again.",
        );
      } finally {
        if (isMounted) {
          setSessionReady(true);
        }
      }
    }

    void verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [navigate, retryCount]);

  const handleRetry = () => {
    setSessionReady(false);
    setSessionError(null);
    setRetryCount((count) => count + 1);
  };

  // Initial session check only.
  if (!sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-stone)] border-t-[var(--color-accent)]" />
      </main>
    );
  }

  // Show an error only when the initial session request fails.
  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
        <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-stone)] bg-white p-7 text-center shadow-sm">
          <h1 className="text-lg font-bold text-[var(--color-ink)]">
            Unable to connect
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            {sessionError}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // Redirect is in progress if there is no authenticated admin.
  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((previous) => !previous)}
          adminName={admin.fullName}
          adminRole="Administrator"
        />

        {/* Main application */}
        <div className="min-w-0 flex-1">
          <AdminHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            adminName={admin.fullName}
          />

          <main className="min-h-[calc(100vh-76px)] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <AdminMobileNav onOpenMore={() => setMobileMenuOpen(true)} />

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <AdminMobileMenu
            onClose={closeMobileMenu}
            adminName={admin.fullName}
            adminRole="Administrator"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
