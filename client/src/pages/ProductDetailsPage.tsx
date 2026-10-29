import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";

import type { Product } from "../types/product";
import { getProductBySlug, getProducts } from "../services/product.service";

import ProductGallery from "../components/product-details/ProductGallery";
import ProductInfo from "../components/product-details/ProductInfo";
import ProductPurchasePanel from "../components/product-details/ProductPurchasePanel";
import ProductOverview from "../components/product-details/ProductOverview";
import ProductSpecifications from "../components/product-details/ProductSpecifications";
import ProductDetailsAccordion from "../components/product-details/ProductDetailsAccordion";
import RelatedProducts from "../components/product-details/RelatedProducts";
import MobilePurchaseBar from "../components/product-details/MobilePurchaseBar";
import { useCart } from "../hooks/useCart";

function getProductHighlights(product: Product): string[] {
  const additionalFeatures =
    product.specifications?.additionalFeatures?.filter(
      (feature) => feature.trim().length > 0,
    ) ?? [];

  if (additionalFeatures.length > 0) {
    return additionalFeatures;
  }

  const specifications = product.specifications;

  if (!specifications) {
    return [];
  }

  return [
    specifications.display,
    specifications.processor,
    specifications.camera,
    specifications.battery,
    specifications.operatingSystem,
  ].filter((value): value is string => Boolean(value?.trim()));
}

function getProductSpecifications(product: Product) {
  const specifications = product.specifications;

  const rows = [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model || product.name },
    {
      label: "Condition",
      value:
        product.condition === "new"
          ? "Brand new"
          : product.condition === "uk-used"
            ? "UK used"
            : "Refurbished",
    },
    { label: "Storage", value: product.storage || specifications?.storage },
    { label: "Colour", value: product.colour || specifications?.color },
    { label: "RAM", value: specifications?.ram },
    { label: "Display", value: specifications?.display },
    { label: "Processor", value: specifications?.processor },
    { label: "Camera", value: specifications?.camera },
    { label: "Battery", value: specifications?.battery },
    { label: "Operating system", value: specifications?.operatingSystem },
    { label: "Network", value: specifications?.network },
  ];

  return rows.filter(
    (row): row is { label: string; value: string } =>
      typeof row.value === "string" && row.value.trim().length > 0,
  );
}

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      if (!slug) {
        setError("This product link is invalid.");
        setLoading(false);
        return;
      }

      try {
        const result = await getProductBySlug(slug);

        if (cancelled) return;

        setProduct(result);
        setLoading(false);

        // Related-product recommendations are loaded separately so
        // their failure does not prevent the main product from displaying.
        try {
          const catalogue = await getProducts({ page: 1, limit: 100 });

          if (!cancelled) {
            setRelatedProducts(catalogue.products);
          }
        } catch {
          if (!cancelled) {
            setRelatedProducts([]);
          }
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "We couldn't load this product. Please try again.",
        );
        setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, retryCount]);

  if (loading) {
    return (
      <main
        className="min-h-[70vh] pb-16"
        aria-busy="true"
        aria-label="Loading product details"
      >
        <div className="page-container">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-3 py-5">
            <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
            <div className="size-1 rounded-full bg-[var(--color-stone)]" />
            <div className="h-3 w-10 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
            <div className="size-1 rounded-full bg-[var(--color-stone)]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 xl:gap-12">
            {/* Image skeleton */}
            <div className="min-w-0">
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-stone)] bg-white sm:aspect-[1.05/1]">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--color-stone)]/40 via-white to-[var(--color-stone)]/60 motion-reduce:animate-none" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-20 items-center justify-center rounded-3xl bg-[var(--color-paper)] text-[var(--color-muted)] sm:size-24">
                    <FiShoppingBag size={36} strokeWidth={1.2} />
                  </div>
                </div>
              </div>

              {/* Thumbnail skeletons */}
              <div className="mt-4 flex gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="aspect-square w-16 animate-pulse rounded-xl border border-[var(--color-stone)] bg-white motion-reduce:animate-none sm:w-20"
                  />
                ))}
              </div>
            </div>

            {/* Product information skeleton */}
            <div className="min-w-0 space-y-6">
              <div className="space-y-4">
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />

                <div className="h-7 w-4/5 animate-pulse rounded-md bg-[var(--color-stone)] motion-reduce:animate-none sm:h-9" />
                <div className="h-7 w-2/3 animate-pulse rounded-md bg-[var(--color-stone)] motion-reduce:animate-none sm:h-9" />

                <div className="flex gap-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
                </div>
              </div>

              <div className="space-y-3 border-y border-[var(--color-stone)] py-5">
                <div className="h-8 w-40 animate-pulse rounded-md bg-[var(--color-stone)] motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
                <div className="h-12 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--color-stone)] motion-reduce:animate-none" />
                <div className="h-12 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--color-stone)] motion-reduce:animate-none" />
              </div>

              <div className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-stone)] bg-white p-4 sm:p-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="size-9 shrink-0 animate-pulse rounded-full bg-[var(--color-stone)] motion-reduce:animate-none" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
                      <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-stone)] motion-reduce:animate-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Screen-reader announcement */}
          <p className="sr-only" role="status">
            Loading product details. Please wait.
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    const isNotFound =
      error.toLowerCase().includes("not found") || error.includes("404");

    const isInvalidLink = error.toLowerCase().includes("invalid");

    const title = isInvalidLink
      ? "Invalid product link"
      : isNotFound
        ? "This phone is no longer available"
        : "We couldn't load this phone";

    const message = isInvalidLink
      ? "The product link appears to be incomplete or incorrect. Head to our shop to discover available phones."
      : isNotFound
        ? "This product may have been removed or is no longer available. Explore our shop to find another device."
        : "Something interrupted the connection while we were fetching this product. Check your internet connection and try again.";

    return (
      <main className="page-container flex min-h-[65vh] items-center justify-center py-16 sm:py-24">
        <section
          className="w-full max-w-lg text-center"
          aria-labelledby="product-error-title"
          role="alert"
        >
          <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-[var(--color-stone)] bg-white shadow-sm sm:size-24">
            <div className="absolute inset-2 rounded-full bg-[var(--color-paper)]" />

            {isNotFound || isInvalidLink ? (
              <FiShoppingBag
                className="relative text-[var(--color-muted)]"
                size={34}
                strokeWidth={1.4}
                aria-hidden="true"
              />
            ) : (
              <FiAlertCircle
                className="relative text-[var(--color-accent)]"
                size={34}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {isNotFound || isInvalidLink
              ? "Product unavailable"
              : "Connection issue"}
          </p>

          <h1
            id="product-error-title"
            className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl"
          >
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            {message}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {!isNotFound && !isInvalidLink && (
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                <FiRefreshCw size={16} aria-hidden="true" />
                Try again
              </button>
            )}

            <Link
              to="/shop"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              <FiArrowLeft size={16} aria-hidden="true" />
              Browse phones
            </Link>
          </div>

          <p className="mt-8 text-xs text-[var(--color-muted)]">
            Need help finding a device? Visit Ogim Store and explore our
            catalogue.
          </p>
        </section>
      </main>
    );
  }

  const description =
    product.description?.trim() ||
    "A detailed product description is not available yet. Please contact Ogim Store if you need more information before ordering.";

  const highlights = getProductHighlights(product);
  const specifications = getProductSpecifications(product);

  const accordionItems = [
    {
      id: "overview",
      title: "Product overview",
      content: (
        <ProductOverview description={description} highlights={highlights} />
      ),
    },
    {
      id: "specifications",
      title: "Specifications",
      content: <ProductSpecifications specifications={specifications} />,
    },
    {
      id: "delivery",
      title: "Delivery & Returns",
      content: (
        <p>
          Delivery options, estimated arrival times, and return terms will be
          displayed here. Final information will come from the store's delivery
          and returns policy.
        </p>
      ),
    },
    {
      id: "warranty",
      title: "Warranty Information",
      content: (
        <p>
          Warranty coverage depends on the product and its condition. Confirm
          the applicable warranty terms before placing an order.
        </p>
      ),
    },
    {
      id: "reviews",
      title: `Reviews (${product.reviewCount ?? 0})`,
      content: (
        <p>
          {typeof product.rating === "number"
            ? `This product has a rating of ${product.rating.toFixed(1)} out of 5 based on ${product.reviewCount ?? 0} reviews.`
            : "Customer reviews are not available yet."}
        </p>
      ),
    },
  ];

  return (
    <main className="pb-28 sm:pb-16">
      {/* Breadcrumbs */}
      <div className="page-container">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 overflow-x-auto py-4 text-xs text-[var(--color-muted)] sm:py-5"
        >
          <Link to="/" className="shrink-0 hover:text-[var(--color-accent)]">
            Home
          </Link>

          <FiChevronRight className="shrink-0" size={13} />

          <Link
            to="/shop"
            className="shrink-0 hover:text-[var(--color-accent)]"
          >
            Shop
          </Link>

          <FiChevronRight className="shrink-0" size={13} />

          <span className="shrink-0">{product.brand}</span>

          <FiChevronRight className="shrink-0" size={13} />

          <span
            aria-current="page"
            className="truncate font-medium text-[var(--color-ink)]"
          >
            {product.name}
          </span>
        </nav>
      </div>

      {/* Product gallery and purchase information */}
      <section className="page-container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 xl:gap-12">
          <ProductGallery
            productName={product.name}
            image={product.image}
            images={product.images}
          />

          <div className="flex min-w-0 flex-col">
            <ProductInfo product={product} />

            <ProductPurchasePanel
              product={product}
              onAddToCart={addToCart}
              onBuyNow={(selectedProduct, quantity) => {
                addToCart(selectedProduct, quantity);
                // Checkout navigation will be connected in the authentication step.
              }}
            />
          </div>
        </div>
      </section>

      {/* Desktop overview and specifications */}
      <section className="page-container mt-10 sm:mt-14">
        <div className="hidden gap-8 md:grid md:grid-cols-2 lg:gap-12">
          <ProductOverview description={description} highlights={highlights} />

          <ProductSpecifications specifications={specifications} />
        </div>

        {/* Expandable information for mobile and smaller screens */}
        <div className="md:hidden">
          <ProductDetailsAccordion items={accordionItems} />
        </div>
      </section>

      {/* Same-brand recommendations */}
      <section className="page-container mt-12 sm:mt-16">
        <RelatedProducts
          product={product}
          products={relatedProducts.filter(
            (item) => item.slug !== product.slug,
          )}
        />
      </section>

      {/* Sticky mobile purchase action */}
      <MobilePurchaseBar product={product} onAddToCart={addToCart} />
    </main>
  );
}
