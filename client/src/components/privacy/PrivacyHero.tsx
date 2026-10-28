import { motion, useReducedMotion } from "framer-motion";
import privacyImage from "../../assets/images/privacypolicy.webp";

export default function PrivacyHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container pt-4 sm:pt-6">
      <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] md:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] sm:text-sm">
            Your privacy matters
          </p>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Privacy policy
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            Your privacy is important to us. This policy explains what
            information Ogim Store may collect, how we use it, and the choices
            available to you when you shop with us.
          </p>

          <p className="mt-5 text-xs text-[var(--color-muted)] sm:text-sm">
            Last updated: October 28, 2026
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
          className="relative flex min-h-[190px] items-center justify-center overflow-hidden bg-[var(--color-paper] px-4 py-5 sm:min-h-[260px] md:min-h-[320px] lg:min-h-[360px]"
        >
          <img
            src={privacyImage}
            alt="Privacy and information protection illustration"
            fetchPriority="high"
            className="h-full max-h-[360px] w-full object-contain object-center"
          />
        </motion.div>
      </div>
    </section>
  );
}
