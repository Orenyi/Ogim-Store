import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiHelpCircle } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";
import NotFoundIllustration from "../components/errors/NotFoundIllustration";

export default function NotFoundPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="flex min-w-0 flex-1 items-center bg-[var(--color-paper)]">
      <section className="page-container w-full py-10 sm:py-14 lg:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          {/* Illustration */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
            className="order-1 md:order-2"
          >
            <NotFoundIllustration />
          </motion.div>

          {/* Message and actions */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.08,
            }}
            className="order-2 text-center md:order-1 md:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-white)] px-3 py-1.5 text-xs font-bold text-[var(--color-accent)] sm:text-sm">
              <FiHelpCircle size={15} aria-hidden="true" />
              Oops! Something went missing
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              This page took
              <span className="block text-[var(--color-accent)]">
                a wrong turn.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)] sm:text-base md:mx-0">
              We can’t find the page you’re looking for. It may have moved, the
              link may be incorrect, or the page may no longer exist.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Link
                to="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                <FiArrowLeft size={17} aria-hidden="true" />
                Back to home
              </Link>

              <Link
                to="/shop"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-5 py-3 text-sm font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Explore phones
                <FiArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-7 text-sm text-[var(--color-muted)]">
              Need help?{" "}
              <Link
                to="/contact"
                className="font-bold text-[var(--color-ink)] underline decoration-[var(--color-accent)] underline-offset-4 transition-colors hover:text-[var(--color-accent)]"
              >
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
