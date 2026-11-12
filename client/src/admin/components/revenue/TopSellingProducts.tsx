import { FiAward } from "react-icons/fi";
import type { TopSellingProduct } from "../../types/revenue.types";

type Props = {
  products: TopSellingProduct[];
};

const formatNaira = (amount: number) =>
  `₦${new Intl.NumberFormat("en-NG").format(amount)}`;

export default function TopSellingProducts({ products }: Props) {
  return (
    <section className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiAward size={19} />
        </span>

        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            Top Selling Products
          </h2>

          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Products with the highest number of sales.
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="mt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_65px_95px] gap-2 border-b border-[var(--color-border)] pb-2 text-[10px] font-bold text-[var(--color-muted)] sm:grid-cols-[minmax(0,1fr)_75px_115px] sm:text-xs">
            <span>Product</span>
            <span className="text-right">Units Sold</span>
            <span className="text-right">Revenue</span>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[minmax(0,1fr)_65px_95px] items-center gap-2 py-2.5 sm:grid-cols-[minmax(0,1fr)_75px_115px]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-10 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--color-surface-muted)]">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[var(--color-ink)]">
                      {product.name}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-[var(--color-muted)]">
                      {product.variant}
                    </p>
                  </div>
                </div>

                <span className="text-right text-xs font-semibold text-[var(--color-ink)]">
                  {product.unitsSold}
                </span>

                <span className="text-right text-xs font-bold text-[var(--color-ink)]">
                  {formatNaira(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-[var(--color-muted)]">
          No product sales data available for this period.
        </p>
      )}
    </section>
  );
}
