import { FiMessageCircle, FiPackage, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Contact us",
    description:
      "Tell us about the issue using our contact form or WhatsApp. Include your order number and a description of the problem.",
    icon: FiMessageCircle,
  },
  {
    number: "02",
    title: "Follow the return instructions",
    description:
      "Wait for our team to review your request and explain the next steps before sending the item.",
    icon: FiPackage,
  },
  {
    number: "03",
    title: "Receive a resolution",
    description:
      "After the returned item has been assessed, our team will confirm the applicable refund or replacement outcome.",
    icon: FiRefreshCw,
  },
];

export default function HowToReturn() {
  return (
    <section className="page-container py-5 sm:py-8">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Step by step
        </p>

        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          How to return an item
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
          Start with our support team so your return can be reviewed and handled
          correctly.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map(({ number, title, description, icon: Icon }) => (
          <li
            key={number}
            className="flex items-start gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:flex-col sm:p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Icon size={20} aria-hidden="true" />
            </span>

            <div>
              <p className="text-xs font-bold tracking-wider text-[var(--color-accent)]">
                STEP {number}
              </p>

              <h3 className="mt-1 text-base font-extrabold text-[var(--color-ink)]">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h3 className="text-base font-extrabold text-[var(--color-ink)]">
            Need help with a return?
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
            Contact our team before sending your phone back.
          </p>
        </div>

        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Contact support
        </Link>
      </div>
    </section>
  );
}
