import { motion, useReducedMotion } from "framer-motion";
import shippingBg from "../../assets/images/shipping.webp";

export default function ShippingHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-container pt-4 sm:pt-6">
      <div
        className="relative isolate flex min-h-[260px] items-center overflow-hidden rounded-[var(--radius-card)] bg-cover bg-center sm:min-h-[320px] lg:min-h-[380px]"
        style={{
          backgroundImage: `url(${shippingBg})`,
          backgroundPosition: "center",
        }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="w-full max-w-[min(100%,440px)] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] sm:text-sm">
            Ogim Store delivery
          </p>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-5xl">
            Shipping &amp;
            <span className="block">delivery</span>
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-[#2b2b2b] sm:text-base sm:leading-7">
            Fast, reliable and secure delivery for your next phone, wherever
            delivery is available across Nigeria.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
