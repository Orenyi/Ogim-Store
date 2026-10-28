import { motion, useReducedMotion } from "framer-motion";
import refundImage from "../../assets/images/refund.webp";

export default function ReturnsHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container pt-4 sm:pt-6">
      <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-paper)]">
        {/* Background image, positioned toward the right */}
        <img
          src={refundImage}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center] sm:object-[70%_center]"
        />

        {/* White overlay: strongest behind the text, fading toward the phones */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f0f0f0] via-white/40 via-45% to-white/0"
        />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="relative flex min-h-[190px] items-center px-5 py-6 sm:min-h-[230px] sm:px-8 sm:py-8 lg:min-h-[260px] lg:px-10"
        >
          <div className="max-w-[65%] sm:max-w-[55%] lg:max-w-[48%]">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-3xl lg:text-4xl">
              Returns &amp; refunds
            </h1>

            <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--color-muted)] sm:mt-3 sm:text-sm sm:leading-6">
              Shop with confidence. Easy returns and a fair refund policy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
