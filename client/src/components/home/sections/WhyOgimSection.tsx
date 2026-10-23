import {
  FiCheckCircle,
  FiCreditCard,
  FiHeadphones,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

const benefits = [
  {
    title: "100% Genuine Phones",
    description: "Verified sources only",
    icon: FiPackage,
  },
  {
    title: "Quality Checked",
    description: "Tested for reliability",
    icon: FiCheckCircle,
  },
  {
    title: "Secure Payments",
    description: "Multiple payment options",
    icon: FiCreditCard,
  },
  {
    title: "Nationwide Delivery",
    description: "Fast and reliable",
    icon: FiTruck,
  },
  {
    title: "After-Sales Support",
    description: "Dedicated customer care",
    icon: FiHeadphones,
  },
];

export default function WhyOgimSection() {
  return (
    <section
      aria-labelledby="why-ogim-heading"
      className="py-10 sm:py-12 lg:py-16"
    >
      <div className="page-container">
        <h2
          id="why-ogim-heading"
          className="mb-8 font-heading text-xl font-bold tracking-tight text-ink sm:mb-8 sm:text-2xl lg:mb-9 lg:text-3xl"
        >
          Why shop with Ogim Store
        </h2>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5 lg:gap-4">
          {benefits.map(({ title, description, icon: Icon }) => (
            <li
              key={title}
              className="flex items-center gap-4 lg:flex-col lg:gap-3 lg:text-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3EEE4] text-ink sm:h-14 sm:w-14">
                <Icon aria-hidden="true" size={23} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 lg:w-full">
                <h3 className="font-heading text-sm font-bold leading-snug text-ink sm:text-base lg:text-sm">
                  {title}
                </h3>

                <p className="mt-1 font-body text-xs leading-relaxed text-muted sm:text-sm lg:text-xs">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
