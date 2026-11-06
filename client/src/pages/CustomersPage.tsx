import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiMoreHorizontal,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import CustomerStats from "../admin/components/customers/CustomerStats";
import CustomerStatusBadge from "../admin/components/customers/CustomerStatusBadge";

import {
  getAdminCustomers,
  updateAdminCustomerStatus,
} from "../admin/services/adminCustomers.service";

import type {
  AdminCustomer,
  CustomersQuery,
  CustomersResponse,
  CustomerTab,
} from "../admin/types/customers.types";

const initialQuery: CustomersQuery = {
  search: "",
  status: "all",
  hasOrders: "all",
  page: 1,
  limit: 10,
};

const emptyResponse: CustomersResponse = {
  customers: [],
  summary: {
    totalCustomers: 0,
    newCustomers: 0,
    customersWithOrders: 0,
    inactiveAccounts: 0,
    percentageChanges: {
      totalCustomers: 0,
      newCustomers: 0,
      customersWithOrders: 0,
      inactiveAccounts: 0,
    },
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const formatNaira = (amount: number) =>
  `₦${new Intl.NumberFormat("en-NG").format(amount)}`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const tabs: { label: string; value: CustomerTab }[] = [
  { label: "All Customers", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function CustomersPage() {
  const [query, setQuery] = useState(initialQuery);
  const [response, setResponse] = useState(emptyResponse);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminCustomers(query);
      setResponse(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load customers.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const pagination = response.pagination;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 5) {
      for (let page = 1; page <= total; page += 1) {
        pages.push(page);
      }

      return pages;
    }

    const start = Math.max(1, Math.min(current - 1, total - 2));

    for (let page = start; page <= Math.min(total, start + 2); page += 1) {
      pages.push(page);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  function updateQuery<K extends keyof CustomersQuery>(
    key: K,
    value: CustomersQuery[K],
  ) {
    setQuery((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  }

  async function handleToggleStatus(customer: AdminCustomer) {
    setStatusLoading(customer.id);
    setActiveMenu(null);
    setError("");

    try {
      await updateAdminCustomerStatus(
        customer.id,
        customer.status === "active" ? "inactive" : "active",
      );

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update customer status.",
      );
    } finally {
      setStatusLoading(null);
    }
  }

  function exportCustomers() {
    const headers = [
      "Customer",
      "Email",
      "Phone",
      "Orders",
      "Total Spent",
      "Status",
      "Joined",
    ];

    const rows = response.customers.map((customer) => [
      customer.fullName,
      customer.email,
      customer.phoneNumber,
      customer.totalOrders,
      customer.totalSpent,
      customer.status,
      formatDate(customer.joinedAt),
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ogim-customers.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const showingFrom =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const showingTo = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <main className="min-w-0 space-y-5 pb-8">
      {/* Page heading */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:text-sm"
        >
          <span>Dashboard</span>
          <FiChevronRight size={14} />
          <span className="text-[var(--color-ink)]">Customers</span>
        </nav>

        <h1 className="font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
          Customers
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          All registered customers on Ogim Store.
        </p>
      </div>

      {/* Summary */}
      <CustomerStats summary={response.summary} />

      {/* Customer management panel */}
      <section className="overflow-visible rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] shadow-[var(--shadow-card)]">
        {/* Tabs */}
        <div className="flex items-center gap-5 overflow-x-auto border-b border-[var(--color-border)] px-4 pt-2 sm:px-5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => updateQuery("status", tab.value)}
              className={`relative shrink-0 px-1 py-4 text-sm font-semibold transition ${
                query.status === tab.value
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {tab.label}

              {query.status === tab.value && (
                <motion.span
                  layoutId="customer-active-tab"
                  className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[var(--color-accent)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 gap-3 border-b border-[var(--color-border)] p-4 sm:p-5 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto] lg:items-center">
          {/* Search */}
          <div className="relative min-w-0">
            <FiSearch
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />

            <input
              type="search"
              value={query.search}
              onChange={(event) => updateQuery("search", event.target.value)}
              placeholder="Search by name, email or phone number..."
              aria-label="Search customers"
              className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] py-2 pl-10 pr-10 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] hover:border-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
            />

            {query.search && (
              <button
                type="button"
                onClick={() => updateQuery("search", "")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <label className="relative">
              <span className="sr-only">Filter by customer status</span>

              <select
                value={query.status}
                onChange={(event) =>
                  updateQuery("status", event.target.value as CustomerTab)
                }
                className="h-11 w-full min-w-[125px] appearance-none rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 pr-9 text-sm text-[var(--color-ink)] outline-none transition hover:border-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <FiChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              />
            </label>

            <label className="relative">
              <span className="sr-only">Filter by orders</span>

              <select
                value={query.hasOrders}
                onChange={(event) =>
                  updateQuery(
                    "hasOrders",
                    event.target.value as CustomersQuery["hasOrders"],
                  )
                }
                className="h-11 w-full min-w-[145px] appearance-none rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 pr-9 text-sm text-[var(--color-ink)] outline-none transition hover:border-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
              >
                <option value="all">Has Orders: All</option>
                <option value="yes">Has Orders</option>
                <option value="no">No Orders</option>
              </select>

              <FiChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              />
            </label>
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={exportCustomers}
            disabled={!response.customers.length}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-accent)] bg-transparent px-5 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiDownload size={16} />
            Export
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mx-4 mt-4 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)] sm:mx-5"
          >
            {error}
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden overflow-visible md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-muted)]">
                  <th className="w-12 px-5 py-4">
                    <span className="sr-only">Customer</span>
                  </th>
                  <th className="px-3 py-4">Customer</th>
                  <th className="px-3 py-4">Email</th>
                  <th className="px-3 py-4">Phone</th>
                  <th className="px-3 py-4 text-center">Orders</th>
                  <th className="px-3 py-4">Total Spent</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Joined</th>
                  <th className="w-14 px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 9 }).map((__, cell) => (
                        <td key={cell} className="px-3 py-5">
                          <div className="h-4 animate-pulse rounded bg-[var(--color-stone)]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : response.customers.length ? (
                  response.customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition-colors hover:bg-[var(--color-paper)]/70"
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${customer.fullName}`}
                          className="h-4 w-4 rounded border-[var(--color-border-strong)] accent-[var(--color-accent)]"
                        />
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="flex min-w-[145px] items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-bold text-[var(--color-ink)]">
                            {customer.initials}
                          </span>

                          <span className="text-xs font-bold text-[var(--color-ink)]">
                            {customer.fullName}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-xs text-[var(--color-muted)]">
                        {customer.email}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-[var(--color-muted)]">
                        {customer.phoneNumber}
                      </td>

                      <td className="px-3 py-3.5 text-center text-xs font-semibold text-[var(--color-ink)]">
                        {customer.totalOrders}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3.5 text-xs font-bold text-[var(--color-ink)]">
                        {formatNaira(customer.totalSpent)}
                      </td>

                      <td className="px-3 py-3.5">
                        <CustomerStatusBadge status={customer.status} />
                      </td>

                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-[var(--color-muted)]">
                        {formatDate(customer.joinedAt)}
                      </td>

                      <td className="relative px-4 py-3.5 text-center">
                        <button
                          type="button"
                          aria-label={`Actions for ${customer.fullName}`}
                          aria-expanded={activeMenu === customer.id}
                          onClick={() =>
                            setActiveMenu((current) =>
                              current === customer.id ? null : customer.id,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink)] transition hover:bg-[var(--color-stone)]"
                        >
                          <FiMoreHorizontal size={19} />
                        </button>

                        <AnimatePresence>
                          {activeMenu === customer.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.98 }}
                              className="absolute right-8 top-10 z-30 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-1.5 text-left shadow-[var(--shadow-dropdown)]"
                            >
                              <button
                                type="button"
                                disabled={statusLoading === customer.id}
                                onClick={() =>
                                  void handleToggleStatus(customer)
                                }
                                className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-paper)] disabled:opacity-50"
                              >
                                {statusLoading === customer.id
                                  ? "Updating..."
                                  : customer.status === "active"
                                    ? "Deactivate customer"
                                    : "Activate customer"}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center">
                      <FiUsers
                        size={28}
                        className="mx-auto text-[var(--color-muted)]"
                      />

                      <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                        No customers found
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile customer list */}
        <div className="divide-y divide-[var(--color-border)] md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-stone)]" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-stone)]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-stone)]" />
                </div>
              </div>
            ))
          ) : response.customers.length ? (
            response.customers.map((customer) => (
              <article key={customer.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-bold text-[var(--color-ink)]">
                    {customer.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                      {customer.fullName}
                    </p>

                    <p className="truncate text-xs text-[var(--color-muted)]">
                      {customer.email}
                    </p>
                  </div>

                  <CustomerStatusBadge status={customer.status} />

                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Actions for ${customer.fullName}`}
                      aria-expanded={activeMenu === customer.id}
                      onClick={() =>
                        setActiveMenu((current) =>
                          current === customer.id ? null : customer.id,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink)] hover:bg-[var(--color-stone)]"
                    >
                      <FiMoreHorizontal size={19} />
                    </button>

                    <AnimatePresence>
                      {activeMenu === customer.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-1.5 shadow-[var(--shadow-dropdown)]"
                        >
                          <button
                            type="button"
                            disabled={statusLoading === customer.id}
                            onClick={() => void handleToggleStatus(customer)}
                            className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper)] disabled:opacity-50"
                          >
                            {statusLoading === customer.id
                              ? "Updating..."
                              : customer.status === "active"
                                ? "Deactivate customer"
                                : "Activate customer"}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-[var(--color-paper)] p-3">
                  <div>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      Phone
                    </p>

                    <p className="mt-1 truncate text-[11px] font-semibold text-[var(--color-ink)]">
                      {customer.phoneNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      Orders
                    </p>

                    <p className="mt-1 text-xs font-bold text-[var(--color-ink)]">
                      {customer.totalOrders}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[var(--color-muted)]">
                      Total Spent
                    </p>

                    <p className="mt-1 truncate text-xs font-bold text-[var(--color-ink)]">
                      {formatNaira(customer.totalSpent)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-[10px] text-[var(--color-muted)]">
                  Joined {formatDate(customer.joinedAt)}
                </p>
              </article>
            ))
          ) : (
            <div className="px-5 py-14 text-center">
              <FiUsers
                size={28}
                className="mx-auto text-[var(--color-muted)]"
              />

              <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                No customers found
              </p>

              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-[var(--color-muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--color-ink)]">
              {showingFrom}–{showingTo}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--color-ink)]">
              {pagination.total.toLocaleString("en-NG")}
            </span>{" "}
            customers
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <label className="mr-1">
              <span className="sr-only">Rows per page</span>

              <select
                value={query.limit}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    limit: Number(event.target.value),
                    page: 1,
                  }))
                }
                className="h-9 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-white)] px-2 text-xs font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </label>

            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => updateQuery("page", pagination.page - 1)}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper)] disabled:opacity-40"
            >
              <FiChevronLeft size={16} />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => updateQuery("page", page)}
                aria-current={pagination.page === page ? "page" : undefined}
                className={`h-9 min-w-9 rounded-lg border px-2 text-xs font-semibold transition ${
                  pagination.page === page
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
                }`}
              >
                {page}
              </button>
            ))}

            {pagination.totalPages > 5 && (
              <>
                <span className="px-1 text-xs text-[var(--color-muted)]">
                  …
                </span>

                <button
                  type="button"
                  onClick={() => updateQuery("page", pagination.totalPages)}
                  className="h-9 min-w-9 rounded-lg border border-[var(--color-border)] px-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
                >
                  {pagination.totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => updateQuery("page", pagination.page + 1)}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper)] disabled:opacity-40"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
