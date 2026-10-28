import { motion, useReducedMotion } from "framer-motion";
import { FiShield, FiHeart, FiDollarSign } from "react-icons/fi";

const values = [
  {
    title: "Authenticity",
    description: "Our phones are verified and tested.",
    icon: FiShield,
  },
  {
    title: "Customer first",
    description: "Your satisfaction comes first.",
    icon: FiHeart,
  },
  {
    title: "Value for money",
    description: "Premium phones at fair prices.",
    icon: FiDollarSign,
  },
];

export default function AboutValues() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container pb-10 pt-4 sm:pb-14 sm:pt-6">
      <h2 className="text-xl font-extrabold sm:text-2xl">What we stand for</h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {values.map(({ title, description, icon: Icon }, index) => (
          <motion.article
            key={title}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
              delay: reduceMotion ? 0 : index * 0.05,
            }}
            className="flex items-center gap-3 rounded-[var(--radius-card)] bg-[var(--color-white)] p-4 sm:flex-col sm:gap-2 sm:px-4 sm:py-5 sm:text-center"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Icon size={20} aria-hidden="true" />
            </span>

            <div>
              <h3 className="text-sm font-extrabold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
                {description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
