import { FiArrowRight, FiMessageCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function FAQContactCTA() {
  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-white)] text-[var(--color-accent)]">
          <FiMessageCircle size={20} aria-hidden="true" />
        </span>

        <div>
          <h2 className="text-base font-extrabold text-[var(--color-ink)] sm:text-lg">
            Still have a question?
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
            Our support team is here to help with your enquiry.
          </p>
        </div>
      </div>

      <Link
        to="/contact"
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 sm:w-auto"
      >
        Contact us
        <FiArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
