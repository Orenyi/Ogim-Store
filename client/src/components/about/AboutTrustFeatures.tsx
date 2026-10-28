import { motion, useReducedMotion } from "framer-motion";
import { FiShield, FiCreditCard, FiTruck, FiHeadphones } from "react-icons/fi";

const features = [
  { title: "100% Genuine Phones", icon: FiShield },
  { title: "Secure Payments", icon: FiCreditCard },
  { title: "Nationwide Delivery", icon: FiTruck },
  { title: "Reliable Support", icon: FiHeadphones },
];

export default function AboutTrustFeatures() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Why shop with Ogim Store"
      className="page-container py-4 sm:py-6"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {features.map(({ title, icon: Icon }, index) => (
          <motion.div
            key={title}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
              delay: reduceMotion ? 0 : index * 0.05,
            }}
            className="flex flex-col items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-white)] px-3 py-4 text-center sm:py-5"
          >
            <span className="mb-2 grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Icon size={19} aria-hidden="true" />
            </span>
            <h2 className="text-xs font-bold leading-snug sm:text-sm">
              {title}
            </h2>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
