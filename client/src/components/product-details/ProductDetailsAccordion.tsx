import { FiChevronDown } from "react-icons/fi";
import type { ReactNode } from "react";

export interface ProductAccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface ProductDetailsAccordionProps {
  items: ProductAccordionItem[];
}

export default function ProductDetailsAccordion({
  items,
}: ProductDetailsAccordionProps) {
  return (
    <div className="divide-y divide-[var(--color-stone)] border-y border-[var(--color-stone)]">
      {items.map((item) => (
        <details key={item.id} open={item.defaultOpen} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
            <span>{item.title}</span>

            <FiChevronDown
              size={18}
              aria-hidden="true"
              className="shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-180"
            />
          </summary>

          <div className="pb-5 text-sm leading-6 text-[var(--color-muted)]">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
