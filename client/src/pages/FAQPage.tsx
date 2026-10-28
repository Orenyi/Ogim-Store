import { useState } from "react";

import { faqs, faqCategories, type FAQCategory } from "../data/faqs";
import FAQAccordion from "../components/faq/FAQAccordion";
import FAQContactCTA from "../components/faq/FAQContactCTA";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("All");

  const filteredFAQs =
    activeCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <main className="min-w-0 bg-[var(--color-paper)]">
      <div className="page-container py-8 sm:py-12 lg:py-14">
        {/* Page heading */}
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:mt-5 sm:text-base">
            Find answers to common questions about our products, orders,
            delivery and more.
          </p>
        </header>

        {/* Category filters */}
        <section
          aria-label="Filter frequently asked questions by category"
          className="mx-auto mt-8 max-w-3xl sm:mt-10"
        >
          <div className="flex gap-2 overflow-x-auto pb-3">
            {faqCategories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:text-sm ${
                    isActive
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* Questions */}
        <section
          aria-label="Frequently asked questions"
          className="mx-auto mt-5 max-w-3xl sm:mt-7"
        >
          <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
            <div>
              <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">
                {activeCategory === "All"
                  ? "All questions"
                  : `${activeCategory} questions`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                Select a question to read the answer.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[var(--color-stone)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)]">
              {filteredFAQs.length}{" "}
              {filteredFAQs.length === 1 ? "question" : "questions"}
            </span>
          </div>

          <FAQAccordion items={filteredFAQs} />
        </section>

        {/* Contact support */}
        <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
          <FAQContactCTA />
        </div>
      </div>
    </main>
  );
}
