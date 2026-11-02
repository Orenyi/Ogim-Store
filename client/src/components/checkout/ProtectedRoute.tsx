import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait until the authentication session has been restored.
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-5">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-stone)] border-t-[var(--color-accent)]" />

          <p className="mt-4 text-sm font-medium text-[var(--color-muted)]">
            Restoring your secure session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return <Outlet />;
}
