import { motion, useReducedMotion } from "framer-motion";

import aboutBg from "../../assets/images/aboutBg.webp";

export default function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container pt-4 sm:pt-6">
      <div
        className="relative isolate flex min-h-[370px] items-start overflow-hidden rounded-[var(--radius-card)] bg-cover bg-center sm:min-h-[410px] lg:min-h-[440px]"
        style={{ backgroundImage: `url(${aboutBg})` }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--color-paper)]/95 via-[var(--color-paper)]/75 to-transparent" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="max-w-[58%] px-4 py-8 sm:px-7 sm:py-10 lg:max-w-[48%] lg:px-10 lg:py-12"
        >
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            About
            <span className="block">Ogim Store</span>
          </h1>

          <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--color-ink)] sm:text-base">
            Genuine phones. Trusted service.
            <span className="block">A better way to shop.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
