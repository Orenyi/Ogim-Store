import { Link } from "react-router-dom";
import { FiChevronRight, FiShield } from "react-icons/fi";

import heroPhones from "../../assets/images/heroPhones.webp";

interface ShopPageHeaderProps {
  productCount: number;
}

export default function ShopPageHeader({ productCount }: ShopPageHeaderProps) {
  const formattedCount = productCount.toLocaleString("en-NG");

  return (
    <section
      aria-labelledby="shop-page-heading"
      className="relative isolate overflow-hidden border-b border-stone/70 bg-paper"
    >
      {/* Full-cover background image with phones positioned to the right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
      >
        <img
          src={heroPhones}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[75%_center] lg:object-[80%_center]"
        />
      </div>

      <div className="page-container relative z-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 pt-3 text-xs sm:pt-4"
        >
          <Link
            to="/"
            className="text-muted transition-colors hover:text-accent focus-visible:text-accent"
          >
            Home
          </Link>

          <FiChevronRight aria-hidden="true" size={13} className="text-muted" />

          <span
            aria-current="page"
            className="font-semibold text-[var(--color-accent)]"
          >
            Shop
          </span>
        </nav>

        {/* Header content */}
        <div className="flex min-h-[112px] items-center justify-between gap-5 py-4 sm:min-h-[125px] lg:min-h-[148px] lg:py-5">
          <div className="min-w-0 max-w-xl flex-1">
            <h1
              id="shop-page-heading"
              className="font-heading text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl"
            >
              All Phones
            </h1>

            <p className="mt-1.5 hidden font-body text-sm leading-6 text-muted sm:block">
              Explore our range of new, UK-used and refurbished phones from top
              brands.
            </p>

            <p
              className="mt-1.5 font-body text-xs text-muted sm:text-sm"
              aria-live="polite"
            >
              {formattedCount} {productCount === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Trust indicator: desktop only */}
          <div className="relative z-10 hidden shrink-0 items-center gap-3 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm lg:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white">
              <FiShield aria-hidden="true" size={21} />
            </span>

            <span className="flex flex-col gap-0.5">
              <span className="font-heading text-xs font-bold text-ink">
                Genuine Phones
              </span>

              <span className="font-body text-[11px] text-muted">
                Verified and trusted
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
