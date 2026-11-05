import { useCallback, useEffect, useState } from "react";
import { FiChevronRight, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import RevenueDateFilter from "../admin/components/revenue/RevenueDateFilter";
import RevenueStats from "../admin/components/revenue/RevenueStats";
import RevenueOverviewChart from "../admin/components/revenue/RevenueOverviewChart";
import SalesByCategory from "../admin/components/revenue/SalesByCategory";
import TopSellingProducts from "../admin/components/revenue/TopSellingProducts";
import RecentRevenueOrders from "../admin/components/revenue/RecentRevenueOrders";

import { getAdminRevenueReport } from "../admin/services/adminRevenue.service";

import type {
  RevenueDateRange,
  RevenueReport,
} from "../admin/types/revenue.types";

const initialRange: RevenueDateRange = {
  period: "this-month",
};

const emptyReport: RevenueReport = {
  summary: {
    totalRevenue: {
      value: 0,
      previousValue: 0,
      percentageChange: 0,
    },
    totalOrders: {
      value: 0,
      previousValue: 0,
      percentageChange: 0,
    },
    unitsSold: {
      value: 0,
      previousValue: 0,
      percentageChange: 0,
    },
    averageOrderValue: {
      value: 0,
      previousValue: 0,
      percentageChange: 0,
    },
  },
  chart: [],
  categories: [],
  topProducts: [],
  recentOrders: [],
};

export default function RevenueReportsPage() {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<RevenueDateRange>(initialRange);

  const [report, setReport] = useState<RevenueReport>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminRevenueReport(dateRange);
      setReport(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load revenue reports.",
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  return (
    <main className="min-w-0 space-y-5 pb-8">
      {/* Heading */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:text-sm"
          >
            <span>Dashboard</span>
            <FiChevronRight size={14} />
            <span className="text-[var(--color-ink)]">
              Revenue &amp; Reports
            </span>
          </nav>

          <h1 className="font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
            Revenue &amp; Reports
          </h1>

          <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
            Track sales, revenue and overall business performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RevenueDateFilter value={dateRange} onChange={setDateRange} />

          <button
            type="button"
            aria-label="Refresh revenue report"
            onClick={() => void loadReport()}
            disabled={loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            <FiRefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadReport()}
            className="w-fit font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-stone)]"
            />
          ))}
        </div>
      ) : (
        <RevenueStats summary={report.summary} />
      )}

      {/* Charts */}
      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <RevenueOverviewChart data={report.chart} />
        <SalesByCategory categories={report.categories} />
      </div>

      {/* Tables */}
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <TopSellingProducts
          products={report.topProducts}
          onViewAll={() => navigate("/admin/products")}
        />

        <RecentRevenueOrders
          orders={report.recentOrders}
          onViewAll={() => navigate("/admin/orders")}
        />
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-[var(--color-muted)]"
        >
          Updating report...
        </motion.div>
      )}
    </main>
  );
}
