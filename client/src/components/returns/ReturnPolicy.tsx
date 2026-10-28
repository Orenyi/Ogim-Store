import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const eligibilityConditions = [
  "The phone is faulty or is not working as expected.",
  "The item received differs from the item you ordered.",
  "The phone and included accessories remain in the required original condition.",
  "For brand-new phones, the original seal remains intact where required by the applicable policy.",
];

export default function ReturnPolicy() {
  return (
    <section className="page-container py-5 sm:py-7">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Know before you return
        </p>

        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Our return policy
        </h2>

        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
          Under the proposed Ogim Store policy, you should contact support
          within 7 days of delivery if your order has a problem. Your return
          request will be reviewed against the applicable eligibility
          conditions.
        </p>

        <ul className="mt-5 space-y-4">
          {eligibilityConditions.map((condition) => (
            <li key={condition} className="flex items-start gap-3">
              <FiCheckCircle
                size={19}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[var(--color-success)]"
              />
              <span className="text-sm leading-6 text-[var(--color-ink)] sm:text-base">
                {condition}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-error-soft)] bg-[var(--color-error-soft)] p-4">
          <FiAlertCircle
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[var(--color-error)]"
          />
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              Important exclusions
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
              Damage caused by misuse, accidents, or unauthorized handling may
              affect return eligibility. Contact support for an assessment
              before sending your device back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
