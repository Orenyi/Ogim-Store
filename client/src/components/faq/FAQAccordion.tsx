import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import type { FAQ } from "../../data/faqs";

type FAQAccordionProps = {
  items: FAQ[];
};

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-strong)] bg-[var(--color-white)]">
      {items.map((faq, index) => {
        const isOpen = openId === faq.id;
        const answerId = `faq-answer-${faq.id}`;

        return (
          <article
            key={faq.id}
            className={index > 0 ? "border-t border-[var(--color-border)]" : ""}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() =>
                setOpenId((current) => (current === faq.id ? null : faq.id))
              }
              className="flex min-h-[64px] w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)] sm:min-h-[72px] sm:px-6 sm:py-5"
            >
              <span className="block min-w-0 flex-1 whitespace-normal text-sm font-semibold leading-6 tracking-normal text-[var(--color-ink)] sm:text-base sm:leading-7">
                {faq.question}
              </span>

              <FiChevronDown
                size={20}
                aria-hidden="true"
                className={`shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              id={answerId}
              hidden={!isOpen}
              className="px-5 pb-5 sm:px-6 sm:pb-6"
            >
              <p className="max-w-3xl whitespace-normal text-sm font-normal leading-7 tracking-normal text-[var(--color-muted)] sm:text-base">
                {faq.answer}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
