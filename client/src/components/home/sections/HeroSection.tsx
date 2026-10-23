import { Link } from "react-router-dom";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";
import heroPhones from "../../../assets/images/heroPhones.webp";

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[520px] overflow-hidden bg-[var(--color-paper)] sm:min-h-[560px] lg:min-h-[590px]"
    >
      {/* Full-width hero background */}
      <img
        src={heroPhones}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[62%_center] sm:object-center"
      />

      {/* Light overlay keeps the text readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--color-paper)] via-[rgba(247,246,242,0.94)] to-[rgba(247,246,242,0.15)]"
      />

      {/* Content follows the shared site container */}
      <div className="page-container relative flex min-h-[520px] items-center py-12 sm:min-h-[560px] lg:min-h-[590px] lg:py-16">
        <div className="w-full max-w-[620px]">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)] sm:text-xs">
            <span>New</span>
            <span className="text-[var(--color-accent)]">•</span>
            <span>UK-Used</span>
            <span className="text-[var(--color-accent)]">•</span>
            <span>Refurbished</span>
          </div>

          <motion.h1
            id="hero-heading"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-[600px] text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[var(--color-ink)] sm:text-5xl lg:text-6xl"
          >
            Find the phone
            <br />
            that fits your world.
          </motion.h1>

          <p className="mt-4 max-w-[470px] text-sm leading-6 text-[#2c2c2c] sm:text-base sm:leading-7">
            Latest iPhones, Samsung, Google and more — new, UK-used and
            refurbished phones at great prices, with verified quality and
            nationwide delivery.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Explore phones
              <FiArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link
              to="/shop?sort=deals"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-white"
            >
              View deals
            </Link>
          </div>
        </div>

        {/* Featured product card */}
        <Link
          to="/products/iphone-16-pro"
          className="hidden absolute bottom-6 right-4 md:flex w-[220px] items-center gap-3 rounded-[var(--radius-control)] border border-white/80 bg-white/95 p-3 shadow-[var(--shadow-dropdown)] backdrop-blur-sm sm:bottom-10 sm:right-6 sm:w-[260px] sm:p-4 lg:bottom-12 lg:right-8"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-[var(--color-ink)] sm:text-sm">
              iPhone 18
            </span>
            <span className="mt-1 block text-[11px] text-[var(--color-muted)] sm:text-xs">
              From ₦2,000,000
            </span>
          </span>

          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-paper)] text-[var(--color-ink)]"
          >
            <FiPlus size={18} />
          </span>
        </Link>
      </div>
    </section>
  );
}
