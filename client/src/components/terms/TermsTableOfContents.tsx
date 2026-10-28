const sections = [
  { id: "acceptance-of-terms", title: "Acceptance of terms" },
  { id: "use-of-services", title: "Use of our services" },
  { id: "products-and-pricing", title: "Products and pricing" },
  { id: "orders-and-payment", title: "Orders and payment" },
  { id: "delivery", title: "Delivery" },
  { id: "returns-and-refunds", title: "Returns and refunds" },
  { id: "intellectual-property", title: "Intellectual property" },
  { id: "limitation-of-liability", title: "Limitation of liability" },
  { id: "changes-to-terms", title: "Changes to these terms" },
  { id: "terms-contact", title: "Contact us" },
];

export default function TermsTableOfContents() {
  return (
    <nav
      aria-labelledby="terms-contents-heading"
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-6"
    >
      <h2
        id="terms-contents-heading"
        className="mb-4 text-lg font-extrabold sm:text-xl"
      >
        In these terms
      </h2>

      <ol className="divide-y divide-[var(--color-border)]">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex items-start gap-3 rounded-[var(--radius-control)] px-2 py-3 transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <span className="w-6 shrink-0 text-sm font-bold text-[var(--color-accent)]">
                {index + 1}.
              </span>

              <span className="text-sm font-medium leading-6 text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]">
                {section.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
