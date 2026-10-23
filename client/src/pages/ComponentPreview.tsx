import { useState } from "react";
import { FiPackage, FiShoppingCart } from "react-icons/fi";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";
import Spinner from "../components/ui/Spinner";
import PageContainer from "../components/layout/PageContainer";

export default function ComponentPreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(true);

  function simulateRetry() {
    setIsLoading(true);

    // Preview-only simulation. Replace with a real API request later.
    window.setTimeout(() => {
      setIsLoading(false);
      setShowError(false);
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] py-10 sm:py-16">
      <PageContainer>
        <header className="mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
            Ogim Store · Development
          </p>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Component preview
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Review our shared UI components before integrating them into the
            storefront.
          </p>
        </header>

        <div className="space-y-10">
          {/* Badges */}
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-bold">Badges</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Product conditions and inventory statuses.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Badge variant="new">New</Badge>
              <Badge variant="used">UK-Used</Badge>
              <Badge variant="refurbished">Refurbished</Badge>
              <Badge variant="success">In Stock</Badge>
              <Badge variant="warning">Low Stock</Badge>
              <Badge variant="error">Sold Out</Badge>
              <Badge variant="info">Payment Pending</Badge>
            </div>
          </section>

          {/* Buttons */}
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-bold">Buttons</h2>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button showArrow>Explore phones</Button>
              <Button variant="secondary">View deals</Button>
              <Button variant="outline">Continue shopping</Button>
              <Button variant="ghost">Cancel</Button>
              <Button disabled>Unavailable</Button>
            </div>
          </section>

          {/* Spinner */}
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-bold">Spinner</h2>

            <div className="mt-5 flex flex-wrap items-center gap-6">
              <Spinner size="sm" label="Loading small item" />
              <Spinner size="md" label="Loading item" />
              <Spinner size="lg" label="Loading large item" />
            </div>
          </section>

          {/* Skeleton */}
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-bold">Skeletons</h2>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Skeleton variant="rectangular" height={180} />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="45%" />
              </div>

              <div className="flex items-start gap-4">
                <Skeleton variant="circular" width={48} />
                <div className="flex-1 space-y-3">
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="75%" />
                </div>
              </div>
            </div>
          </section>

          {/* Empty state */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Empty state</h2>

            <EmptyState
              icon={<FiShoppingCart size={25} aria-hidden="true" />}
              title="Your cart is empty"
              description="Find your next phone and add it to your cart."
              actionLabel="Explore phones"
              onAction={() => {
                window.alert(
                  "Preview only: shop navigation will be connected.",
                );
              }}
            />
          </section>

          {/* Error state */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Error state</h2>

            {showError ? (
              <ErrorState
                title="Couldn't load products"
                description="This is a preview of how we will handle a failed product request."
                onRetry={simulateRetry}
                isRetrying={isLoading}
              />
            ) : (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-success)]/20 bg-white p-6">
                <div className="flex items-center gap-3 text-[var(--color-success)]">
                  <FiPackage size={22} />
                  <p className="font-semibold">Retry interaction completed</p>
                </div>

                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  This was only a simulated retry, not a backend request.
                </p>

                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setShowError(true)}
                >
                  Reset error preview
                </Button>
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
