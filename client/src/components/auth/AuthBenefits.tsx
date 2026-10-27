import { FiHeart, FiPackage, FiShield, FiTruck } from "react-icons/fi";

const benefits = [
  {
    icon: FiTruck,
    title: "Faster checkout",
    description: "Save your details for quicker purchases.",
  },
  {
    icon: FiPackage,
    title: "Track your orders",
    description: "Get real-time order updates.",
  },
  {
    icon: FiShield,
    title: "Exclusive deals",
    description: "Access member-only offers.",
  },
  {
    icon: FiHeart,
    title: "Wishlist",
    description: "Save your favourite phones.",
  },
];

interface AuthBenefitsProps {
  eyebrow: string;
  heading: string;
  description: string;
  showBenefits?: boolean;
}

export default function AuthBenefits({
  eyebrow,
  heading,
  description,
  showBenefits = true,
}: AuthBenefitsProps) {
  return (
    <section className="relative flex min-h-[180px] flex-col overflow-hidden rounded-[var(--radius-card)] p-5 sm:min-h-[200px] sm:p-7 lg:min-h-[600px] lg:justify-between  lg:p-10">
      <div className="relative z-10 max-w-[440px]">
        <p className="mb-3 text-sm font-semibold text-[var(--color-accent)]">
          {eyebrow}
        </p>

        <h1 className="max-w-[420px] text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl lg:text-5xl">
          {heading}
        </h1>

        <p className="mt-3 max-w-[390px] text-sm leading-6 text-[var(--color-muted)] sm:mt-4 sm:text-base">
          {description}
        </p>
      </div>

      {showBenefits && (
        <>
          <ul className="relative z-10 mt-8 hidden space-y-5 lg:block">
            {benefits.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-accent)] shadow-[var(--shadow-sm)]">
                  <Icon size={18} aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--color-ink)]">
                    {title}
                  </p>
                  <p className="text-xs leading-5 text-[var(--color-muted)]">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="relative z-10 mt-6 hidden items-center gap-3 border-t border-[var(--color-border-strong)] pt-5 lg:flex">
            <FiShield
              size={20}
              aria-hidden="true"
              className="shrink-0 text-[var(--color-accent)]"
            />
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              Shop with confidence at Ogim Store.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
