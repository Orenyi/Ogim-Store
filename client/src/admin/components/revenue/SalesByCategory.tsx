import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { FiTrendingUp } from "react-icons/fi";
import type { SalesCategory } from "../../types/revenue.types";

type Props = {
  categories: SalesCategory[];
};

const categoryColors = ["#F06428", "#FFB36B", "#287A55", "#C7C9CC"];

const formatNaira = (value: number) =>
  `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

export default function SalesByCategory({ categories }: Props) {
  const totalRevenue = categories.reduce(
    (total, category) => total + category.revenue,
    0,
  );

  return (
    <section className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiTrendingUp size={19} />
        </span>
        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            Sales by Category
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Revenue contribution by product category.
          </p>
        </div>
      </div>

      {categories.length ? (
        <div className="mt-5 grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(130px,0.9fr)_1fr]">
          <div className="relative mx-auto h-[190px] w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="94%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {categories.map((category, index) => (
                    <Cell
                      key={category.id}
                      fill={categoryColors[index % categoryColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatNaira(Number(value))}
                  contentStyle={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-heading text-xl font-extrabold text-[var(--color-ink)]">
                {formatNaira(totalRevenue)}
              </p>
              <p className="text-[10px] text-[var(--color-muted)]">
                Total Revenue
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        categoryColors[index % categoryColors.length],
                    }}
                  />
                  <span className="truncate text-xs font-medium text-[var(--color-ink)]">
                    {category.name} ({category.percentage}%)
                  </span>
                </div>
                <span className="shrink-0 text-xs font-bold text-[var(--color-ink)]">
                  {formatNaira(category.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-[var(--color-muted)]">
          No category sales data available for this period.
        </p>
      )}
    </section>
  );
}
