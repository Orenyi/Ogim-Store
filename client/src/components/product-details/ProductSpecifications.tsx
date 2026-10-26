export interface ProductSpecification {
  label: string;
  value: string;
}

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
  title?: string;
}

export default function ProductSpecifications({
  specifications,
  title = "Key specifications",
}: ProductSpecificationsProps) {
  return (
    <section aria-labelledby="product-specifications-title" className="min-w-0">
      <h2 id="product-specifications-title" className="text-xl sm:text-2xl">
        {title}
      </h2>

      {specifications.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-stone)] bg-white">
          <dl className="divide-y divide-[var(--color-stone)]">
            {specifications.map((specification, index) => (
              <div
                key={`${specification.label}-${index}`}
                className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 px-4 py-3 text-sm"
              >
                <dt className="text-[var(--color-muted)]">
                  {specification.label}
                </dt>

                <dd className="min-w-0 break-words font-medium text-[var(--color-ink)]">
                  {specification.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-stone)] bg-white p-4 text-sm text-[var(--color-muted)]">
          Specifications are not available yet.
        </p>
      )}
    </section>
  );
}
