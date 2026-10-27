import { Link } from "react-router-dom";
import { FiArrowLeft, FiTrash2, FiChevronRight } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import { useToast } from "../components/ui/ToastProvider";
import CartBenefits from "../components/cart/CartBenefits";
import CartEmptyState from "../components/cart/CartEmptyState";
import CartItemList from "../components/cart/CartItemList";
import CartOrderSummary from "../components/cart/CartOrderSummary";
import CartPriceAlert from "../components/cart/CartPriceAlert";
import CartRecommendations from "../components/cart/CartRecommendations";
import CartSkeleton from "../components/cart/CartSkeleton";

export default function CartPage() {
  const { items, lineCount, clearCart, isHydrated } = useCart();
  const toast = useToast();

  const isEmpty = items.length === 0;

  function handleCheckout() {
    toast.info(
      "Account-required checkout will be connected in the authentication step.",
    );
  }

  return (
    <main className="pb-12 sm:pb-16">
      <div className="page-container">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 py-4 text-xs text-[var(--color-muted)] sm:py-5 sm:text-sm"
        >
          <Link
            to="/"
            className="transition-colors hover:text-[var(--color-ink)]"
          >
            Home
          </Link>
          <FiChevronRight size={14} aria-hidden="true" />
          <span
            aria-current="page"
            className="font-medium text-[var(--color-ink)]"
          >
            Cart
          </span>
        </nav>

        {!isHydrated ? (
          <CartSkeleton itemCount={3} />
        ) : isEmpty ? (
          <>
            <CartEmptyState />
            <CartRecommendations />
          </>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your Cart ({lineCount} {lineCount === 1 ? "item" : "items"})
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)] sm:text-base">
                Review your items before checkout.
              </p>
            </header>

            <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-4">
                <CartItemList />
                <CartPriceAlert />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <Link
                    to="/shop"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--color-surface)] sm:px-5"
                  >
                    <FiArrowLeft size={16} aria-hidden="true" />
                    Continue Shopping
                  </Link>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-error)] hover:text-[var(--color-error)] sm:px-5"
                  >
                    <FiTrash2 size={16} aria-hidden="true" />
                    Clear Cart
                  </button>
                </div>
              </div>

              <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
                <CartOrderSummary onCheckout={handleCheckout} />
                <CartBenefits />
              </aside>
            </div>

            <CartRecommendations />
          </>
        )}
      </div>
    </main>
  );
}
