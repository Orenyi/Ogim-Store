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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Initial loading state.
  if (loading && !dashboard) {
    return <DashboardSkeleton />;
  }

  // Error state when no previous dashboard data is available.
  if (error && !dashboard) {
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
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
      {/* Dashboard refresh and error feedback */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-muted)]">
            Live data from your store
          </p>

          {error && (
            <p role="alert" className="mt-1 text-xs text-[var(--color-error)]">
              Refresh failed: {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

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
