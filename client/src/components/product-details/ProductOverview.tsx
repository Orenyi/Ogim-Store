import { FiCheckCircle } from "react-icons/fi";

interface ProductOverviewProps {
  description: string;
  highlights: string[];
}

export default function ProductOverview({
  description,
  highlights,
}: ProductOverviewProps) {
  return (
    <section aria-labelledby="product-overview-title" className="min-w-0">
      <h2 id="product-overview-title" className="text-xl sm:text-2xl">
        Product overview
      </h2>

      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        {description}
      </p>

      {highlights.length > 0 && (
        <ul className="mt-5 space-y-3">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-3 text-sm leading-6"
            >
              <FiCheckCircle
                size={17}
                aria-hidden="true"
                className="mt-1 shrink-0 text-[var(--color-accent)]"
              />

              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
