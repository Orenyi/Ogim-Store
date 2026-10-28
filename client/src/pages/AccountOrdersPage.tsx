import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiFilter,
  FiPackage,
  FiSearch,
  FiShoppingBag,
} from "react-icons/fi";

import AccountLayout from "../components/account/AccountLayout";
import AccountMobileMenu from "../components/account/AccountMobileMenu";
import RecentOrderCard from "../components/account/RecentOrderCard";
import { orders, type OrderStatus } from "../data/orders";

type OrderFilter = "All" | OrderStatus;

const filters: OrderFilter[] = [
  "All",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AccountOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const orderCounts = useMemo(() => {
    return {
      All: orders.length,
      Processing: orders.filter((order) => order.status === "Processing")
        .length,
      Shipped: orders.filter((order) => order.status === "Shipped").length,
      Delivered: orders.filter((order) => order.status === "Delivered").length,
      Cancelled: orders.filter((order) => order.status === "Cancelled").length,
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "All" || order.status === activeFilter;

      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("All");
  };

  return (
    <AccountLayout>
      <div className="space-y-5 sm:space-y-6">
        <AccountMobileMenu />

        <header>
          <Link
            to="/account"
            className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] lg:hidden"
          >
            <FiArrowLeft size={15} aria-hidden="true" />
            Account overview
          </Link>

          <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">
            Your purchases
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            My orders
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            View and track all your orders in one place.
          </p>
        </header>

        {/* Order status filters */}
        <div
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Filter orders by status"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                id={`order-filter-${filter.toLowerCase()}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="account-orders-results"
                onClick={() => setActiveFilter(filter)}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                  isActive
                    ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]",
                ].join(" ")}
              >
                {filter}

                <span
                  className={[
                    "grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-stone)] text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {orderCounts[filter]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search orders</span>

            <FiSearch
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search orders by reference or product..."
              className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-white)] pl-10 pr-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] sm:px-4 sm:text-sm"
            aria-label="Clear order filters"
          >
            <FiFilter size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Clear filters</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>

        {/* Order results */}
        <section
          id="account-orders-results"
          role="tabpanel"
          aria-labelledby={`order-filter-${activeFilter.toLowerCase()}`}
          aria-live="polite"
          className="space-y-3"
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <RecentOrderCard order={order} />
              </motion.div>
            ))
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-white)] px-5 py-10 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-paper)]">
                {searchQuery ? (
                  <FiSearch
                    size={25}
                    className="text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                ) : (
                  <FiPackage
                    size={25}
                    className="text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                )}
              </div>

              <h2 className="text-base font-bold text-[var(--color-ink)]">
                {searchQuery ? "No matching orders" : "No orders found"}
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                {searchQuery
                  ? "Try another order reference or product name, or clear your filters."
                  : `You don't have any ${activeFilter.toLowerCase()} orders right now.`}
              </p>

              {searchQuery || activeFilter !== "All" ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/shop"
                  className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                >
                  <FiShoppingBag size={16} aria-hidden="true" />
                  Start shopping
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
