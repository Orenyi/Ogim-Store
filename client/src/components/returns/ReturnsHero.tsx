import { motion, useReducedMotion } from "framer-motion";
import refundImage from "../../assets/images/refund.webp";

export default function ReturnsHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container pt-4 sm:pt-6">
      <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var( --color-paper)] md:grid-cols-[1.05fr_0.95fr]">
        {/* Left: Text content */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] sm:text-sm">
            Shop with confidence
          </p>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Returns
            <span className="block">&amp; refunds</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            We want you to shop with confidence. Read our return policy to
            understand eligibility, how to request a return, and what happens
            next.
          </p>
        </motion.div>

        {/* Right: Refund image */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
          className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-[var( --color-paper)] px-4 py-5 sm:min-h-[260px] md:min-h-[320px] lg:min-h-[360px]"
        >
          <img
            src={refundImage}
            alt="Smartphones illustrating returns and refunds"
            fetchPriority="high"
            className="h-full max-h-[360px] w-full object-contain object-center"
          />
        </motion.div>
      </div>
    </section>
  );
}
