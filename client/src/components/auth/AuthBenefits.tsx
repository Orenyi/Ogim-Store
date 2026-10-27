import { FiHeart, FiPackage, FiShield, FiTruck } from "react-icons/fi";

const benefits = [
  {
    icon: FiTruck,
    title: "Faster checkout",
    description: "Save your details for quicker purchases.",
  },
  {
    icon: FiPackage,
    title: "Track orders",
    description: "Get updates on your orders.",
  },
  {
    icon: FiShield,
    title: "Exclusive deals",
    description: "Be the first to hear about special offers.",
  },
  {
    icon: FiHeart,
    title: "Wishlist",
    description: "Save your favourite phones.",
  },
];

export default function AuthBenefits() {
  return (
    <section className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[var(--radius-card)]  p-5 sm:min-h-[240px] sm:p-7 lg:min-h-[680px] lg:justify-between lg:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(240,100,40,0.09),transparent_55%)]"
      />

      <div className="relative z-10 max-w-[440px]">
        <p className="mb-3 text-sm font-semibold text-[var(--color-accent)]">
          + Join Ogim Store
        </p>

        <h1 className="max-w-[420px] text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-5xl">
          Create your account
        </h1>

        <p className="mt-3 max-w-[390px] text-sm leading-6 text-[var(--color-muted)] sm:mt-4 sm:text-base">
          Shop genuine new, UK-used and refurbished phones at the best prices.
          Create an account to get exclusive deals, track your orders and more.
        </p>
      </div>

      {/* Benefits are displayed only on desktop */}
      <ul className="relative z-10 mt-auto hidden space-y-4 pt-8 lg:block lg:space-y-5">
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

      {/* Trust note is also desktop-only */}
      <div className="relative z-10 mt-6 hidden items-center gap-3 border-t border-[var(--color-border-strong)] pt-5 lg:flex">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-accent)]">
          <FiShield size={18} aria-hidden="true" />
        </span>

        <p className="text-xs leading-5 text-[var(--color-muted)]">
          Enjoy a more convenient shopping experience with your Ogim Store
          account.
        </p>
      </div>
    </section>
  );
}
