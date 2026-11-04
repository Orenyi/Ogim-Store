import { useCallback, useEffect, useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import DashboardStats from "../admin/components/dashboard/DashboardStats";
import RevenueOverview from "../admin/components/dashboard/RevenueOverview";
import OrdersByStatus from "../admin/components/dashboard/OrdersByStatus";
import RecentOrders from "../admin/components/dashboard/RecentOrders";
import QuickActions from "../admin/components/dashboard/QuickActions";
import DashboardSkeleton from "../admin/components/dashboard/DashboardSkeleton";

import { getAdminDashboard } from "../admin/services/adminDashboard.service";

import type { AdminDashboardResponse } from "../admin/types/dashboard.types";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminDashboard();
      setDashboard(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const isDemoMode = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-5">
        <div
          role="alert"
          className="rounded-[var(--radius-card)] border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FiAlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-error)]"
              />

              <div>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  Dashboard information unavailable
                </p>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {error || "No dashboard information was returned."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <FiRefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
      {/* Statistics */}
      <DashboardStats stats={dashboard.stats} />

      {/* Revenue and order status charts */}
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.55fr_1fr] xl:gap-5">
        <RevenueOverview data={dashboard.revenue} />

        <OrdersByStatus data={dashboard.orderStatuses} />
      </div>

      {/* Recent orders and quick actions */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[1.65fr_0.9fr] xl:gap-5">
        <RecentOrders orders={dashboard.recentOrders} />

        <QuickActions />
      </div>
    </div>
  );
}
