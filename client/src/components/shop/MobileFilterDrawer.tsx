import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiX } from "react-icons/fi";

import ShopFilters from "./ShopFilters";
import type { ShopFilterState } from "./ShopFilters";
import type { Product } from "../../types/product";

interface MobileFilterDrawerProps {
  open: boolean;
  products: Product[];
  filters: ShopFilterState;
  onChange: (filters: ShopFilterState) => void;
  onClear: () => void;
  onClose: () => void;
  onApply: () => void;
  resultCount: number;
}

export default function MobileFilterDrawer({
  open,
  products,
  filters,
  onChange,
  onClear,
  onClose,
  onApply,
  resultCount,
}: MobileFilterDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="fixed inset-0 z-[var(--z-overlay)] cursor-default bg-black/45 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-12px_40px_rgba(21,23,28,0.16)] lg:hidden"
            initial={shouldReduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              ease: "easeOut",
            }}
          >
            <div className="flex justify-center pt-2.5">
              <span
                aria-hidden="true"
                className="h-1 w-10 rounded-full bg-stone"
              />
            </div>

            <div className="flex items-center justify-between border-b border-stone px-4 py-3">
              <h2
                id="mobile-filter-title"
                className="font-heading text-base font-bold text-ink"
              >
                Filters
              </h2>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F3EE] text-ink hover:bg-stone"
              >
                <FiX aria-hidden="true" size={19} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <ShopFilters
                products={products}
                filters={filters}
                onChange={onChange}
                onClear={onClear}
              />
            </div>

            <div className="border-t border-stone bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onApply}
                className="min-h-11 w-full rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Show {resultCount.toLocaleString("en-NG")}{" "}
                {resultCount === 1 ? "product" : "products"}
              </button>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
