import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { storeBrands } from "../data/brands";

export default function ShopByBrandSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollNext() {
    const container = scrollRef.current;
    if (!container) return;

    const firstItem = container.querySelector<HTMLElement>("[data-brand-item]");

    const gap = 16;
    const distance = firstItem
      ? firstItem.getBoundingClientRect().width + gap
      : container.clientWidth * 0.75;

    container.scrollBy({
      left: distance * 2,
      behavior: "smooth",
    });
  }

  return (
    <section
      aria-labelledby="shop-by-brand-heading"
      className="bg-[var(--color-paper)] py-8 sm:py-10 lg:py-12"
    >
      <div className="page-container">
        <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
          <h2
            id="shop-by-brand-heading"
            className="text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-2xl"
          >
            Shop by brand
          </h2>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
          >
            View all brands
            <FiArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
            aria-label="Phone brands"
          >
            {storeBrands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                data-brand-item
                className="group flex w-[72px] shrink-0 snap-start flex-col items-center justify-center rounded-full bg-[#eeebe2] px-2 py-3 transition-colors hover:bg-[var(--color-stone)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:w-[84px] sm:py-4 lg:w-[122px] lg:py-6"
                aria-label={`Shop ${brand.name} phones`}
              >
                <span className="flex h-8 w-full items-center justify-center sm:h-9 lg:h-10">
                  <img
                    src={brand.logo}
                    alt=""
                    loading="lazy"
                    className="max-h-7 max-w-full object-contain transition-transform duration-200 group-hover:scale-105 sm:max-h-8 lg:max-h-9"
                  />
                </span>

                <span className="mt-2 text-[10px] font-semibold leading-tight text-[var(--color-ink)] sm:mt-3 sm:text-xs">
                  {brand.name}
                </span>

                <span className="mt-1 text-[10px] leading-tight text-[var(--color-muted)] sm:text-xs">
                  Shop
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Show more brands"
            className="absolute right-0 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-stone)] bg-[var(--color-paper)]/95 text-[var(--color-ink)] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:hidden"
          >
            <FiChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
