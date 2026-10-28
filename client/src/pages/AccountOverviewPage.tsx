import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart, FiMapPin, FiShoppingBag } from "react-icons/fi";

import AccountLayout from "../components/account/AccountLayout";
import AccountMobileMenu from "../components/account/AccountMobileMenu";
import AccountStatCard from "../components/account/AccountStatCard";
import RecentOrderCard from "../components/account/RecentOrderCard";
import { useAuth } from "../context/AuthContext";
import { orders } from "../data/orders";

const statistics = [
  {
    label: "Total orders",
    value: orders.length,
    linkLabel: "View orders",
    to: "/account/orders",
    icon: FiShoppingBag,
    iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  },
  {
    label: "Saved items",
    value: 4,
    linkLabel: "Browse phones",
    to: "/shop",
    icon: FiHeart,
    iconClass: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  },
  {
    label: "Addresses",
    value: 2,
    linkLabel: "Contact support",
    to: "/contact",
    icon: FiMapPin,
    iconClass: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  },
];

function SectionHeading({
  title,
  actionLabel,
  actionTo,
}: {
  title: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold tracking-tight text-[var(--color-ink)] sm:text-lg">
        {title}
      </h2>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
        >
          {actionLabel}
          <FiArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default function AccountOverviewPage() {
  const { user } = useAuth();

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  // Display the latest three orders first.
  // The data uses ISO-sortable dates in production; these demo dates
  // are currently formatted strings, so keep the intended order explicit.
  const recentOrders = [...orders].slice(0, 3);

  return (
    <AccountLayout>
      <div className="space-y-6 sm:space-y-7">
        <AccountMobileMenu />

        {/* Page heading */}
        <header>
          <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">
            Your account
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Account overview
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Welcome back, {firstName}! Here&apos;s a quick view of your
            activity.
          </p>
        </header>

        {/* Account statistics */}
        <section aria-label="Account statistics">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {statistics.map((stat, index) => (
              <AccountStatCard key={stat.label} {...stat} index={index} />
            ))}
          </div>
        </section>

        {/* Promotional banner */}
        <section
          aria-label="Shop new phones"
          className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-accent-soft)]"
        >
          <div className="relative z-10 flex min-h-[170px] items-center p-5 sm:min-h-[190px] sm:p-7">
            <div className="max-w-[65%] sm:max-w-[58%]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] sm:text-xs">
                Find your next phone
              </p>

              <h2 className="text-lg font-bold leading-snug tracking-tight text-[var(--color-ink)] sm:text-2xl">
                A better phone is one click away.
              </h2>

              <p className="mt-2 hidden max-w-sm text-xs leading-5 text-[var(--color-muted)] sm:block sm:text-sm">
                Explore the latest arrivals and discover phones selected for
                you.
              </p>

              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] sm:text-sm"
              >
                Shop now
                <FiArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {/* Decorative phone illustration */}
            <div
              className="pointer-events-none absolute -right-1 bottom-0 top-0 flex w-[39%] items-center justify-center sm:right-4 sm:w-[34%]"
              aria-hidden="true"
            >
              <div className="absolute h-28 w-28 rounded-full bg-white/50 sm:h-40 sm:w-40" />

              <div className="absolute right-[48%] top-[22%] h-[88px] w-[48px] rotate-[-12deg] rounded-[13px] border-[3px] border-[var(--color-ink)] bg-[var(--color-stone)] shadow-lg sm:h-[120px] sm:w-[64px]">
                <div className="absolute left-1.5 top-1.5 h-5 w-5 rounded-lg bg-[var(--color-muted)] sm:h-7 sm:w-7" />
                <div className="absolute inset-x-1.5 bottom-2 h-1 rounded-full bg-[var(--color-border-strong)]" />
              </div>

              <div className="absolute right-[17%] top-[12%] h-[105px] w-[53px] rotate-[9deg] rounded-[14px] border-[3px] border-[var(--color-ink)] bg-[var(--color-white)] shadow-xl sm:h-[145px] sm:w-[72px]">
                <div className="absolute left-1.5 top-1.5 h-6 w-6 rounded-lg bg-[var(--color-stone)] sm:h-8 sm:w-8" />
                <div className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-[var(--color-stone)]" />
              </div>
            </div>
          </div>
        </section>

        {/* Recent orders */}
        <section aria-label="Recent orders">
          <SectionHeading
            title="Recent orders"
            actionLabel="View all orders"
            actionTo="/account/orders"
          />

          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <RecentOrderCard key={order.id} order={order} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-10 text-center">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                No orders yet
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Your purchases will appear here when you place an order.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
              >
                Start shopping
                <FiArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}

          <Link
            to="/account/orders"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] sm:hidden"
          >
            View all orders
            <FiArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </AccountLayout>
  );
}
