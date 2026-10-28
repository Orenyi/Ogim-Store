import { motion, useReducedMotion } from "framer-motion";
import ourStory from "../../assets/images/ourstory.webp";

export default function AboutStory() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container py-4 sm:py-6">
      <div className="grid grid-cols-1 items-center gap-5 sm:gap-6 md:grid-cols-[1fr_0.9fr] md:gap-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <h2 className="text-xl font-extrabold sm:text-2xl">Our story</h2>

          <p className="mt-3 text-xs leading-5 text-[var(--color-muted)] sm:text-sm sm:leading-6">
            Ogim Store was founded with a simple goal: to make genuine
            smartphones accessible to everyone in Nigeria. We started as a small
            team of tech enthusiasts and have grown into a trusted destination
            for customers across the country.
          </p>

          <p className="mt-3 text-xs leading-5 text-[var(--color-muted)] sm:text-sm sm:leading-6">
            Ogim Store is a trusted online store for new and UK-used
            smartphones. We make it easy for Nigerians to buy genuine phones at
            great prices, with reliable delivery and after-sales support.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          className="overflow-hidden rounded-[var(--radius-card)]"
        >
          <img
            src={ourStory}
            alt="Ogim Store phones and products"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
