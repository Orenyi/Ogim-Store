import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

const conditions = [
  {
    title: "Brand New",
    description: "Latest models, sealed and with full warranty.",
    slug: "new",
    number: "01",
    accent: "bg-[#F5EDE2]",
  },
  {
    title: "UK-Used",
    description: "Carefully used, great value and fully tested.",
    slug: "uk-used",
    number: "02",
    accent: "bg-[#EEEBE4]",
  },
  {
    title: "Refurbished",
    description: "Quality phones, tested and certified.",
    slug: "refurbished",
    number: "03",
    accent: "bg-[#F1EEE8]",
  },
];

export default function ShopByConditionSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="shop-by-condition-heading"
      className="py-10 sm:py-12 lg:py-16"
    >
      <div className="page-container">
        <div className="mb-6 sm:mb-8">
          <h2
            id="shop-by-condition-heading"
            className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            Shop by condition
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {conditions.map((condition, index) => (
            <motion.div
              key={condition.slug}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                delay: shouldReduceMotion ? 0 : index * 0.08,
              }}
            >
              <Link
                to={`/shop?condition=${condition.slug}`}
                aria-label={`Shop ${condition.title} phones`}
                className={[
                  "group relative flex min-h-[190px] h-full",
                  "flex-col justify-between overflow-hidden rounded-2xl",
                  "border border-stone/70 p-5 sm:min-h-[205px] sm:p-6",
                  condition.accent,
                  "transition-shadow duration-300 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-accent focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <div>
                  <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Collection {condition.number}
                  </p>

                  <h3 className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    {condition.title}
                  </h3>

                  <p className="mt-2 max-w-[260px] font-body text-sm leading-6 text-muted">
                    {condition.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-colors group-hover:bg-accent group-hover:text-white">
                    <FiArrowRight aria-hidden="true" size={19} />
                  </span>

                  <span className="font-body text-xs font-semibold text-muted transition-colors group-hover:text-ink">
                    Explore collection
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/70 transition-transform duration-500 group-hover:scale-125 sm:h-36 sm:w-36"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
