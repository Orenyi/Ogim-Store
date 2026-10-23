import { FiShield, FiCreditCard, FiTruck, FiHeadphones } from "react-icons/fi";
import type { IconType } from "react-icons";

interface TrustBenefit {
  title: string;
  description: string;
  shortLabel: string;
  Icon: IconType;
}

const benefits: TrustBenefit[] = [
  {
    title: "100% Genuine Phones",
    description: "Verified and trusted",
    shortLabel: "Genuine",
    Icon: FiShield,
  },
  {
    title: "Secure Payments",
    description: "Your payments are safe",
    shortLabel: "Secure",
    Icon: FiCreditCard,
  },
  {
    title: "Nationwide Delivery",
    description: "Fast and reliable",
    shortLabel: "Delivery",
    Icon: FiTruck,
  },
  {
    title: "After-Sales Support",
    description: "We're here to help",
    shortLabel: "Support",
    Icon: FiHeadphones,
  },
];

export default function TrustBenefitsSection() {
  return (
    <section
      aria-label="Why customers can shop with confidence"
      className="border-y border-[var(--color-stone)]/70 bg-[var(--color-paper)]"
    >
      <div className="page-container py-5 sm:py-6 lg:py-7">
        <ul className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {benefits.map(({ title, description, shortLabel, Icon }) => (
            <li
              key={title}
              className="flex min-w-0 flex-col items-center gap-2  lg:flex-row lg:gap-3"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-stone)]/70 bg-[#F0ECE3] text-[var(--color-ink)] sm:size-10 lg:size-11">
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              </span>

              {/* Compact label for mobile and tablet */}
              <span className="text-[10px] font-semibold leading-tight text-[var(--color-ink)] sm:text-xs lg:hidden">
                {shortLabel}
              </span>

              {/* Full text for desktop */}
              <span className="hidden min-w-0 lg:block">
                <span className="block text-xs font-bold leading-snug text-[var(--color-ink)] xl:text-sm">
                  {title}
                </span>
                <span className="mt-1 block text-xs leading-snug text-[var(--color-muted)]">
                  {description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
