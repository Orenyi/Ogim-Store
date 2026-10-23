import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiCheckCircle, FiLoader } from "react-icons/fi";

import phoneNews from "../../../assets/images/phone_news.webp";

type SubscribeStatus = "idle" | "success" | "error";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setStatus("idle");
    setIsSubmitting(true);

    try {
      // Replace with your newsletter API request before production.
      // This placeholder does not save or subscribe the email.
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="py-10 sm:py-12 lg:py-14"
    >
      <div className="page-container">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: "easeOut",
          }}
          className="relative isolate min-h-[230px] overflow-hidden rounded-2xl border border-stone bg-[#191B21] px-5 py-7 sm:min-h-[245px] sm:px-7 sm:py-8 md:min-h-[250px] md:px-8 md:py-9 lg:min-h-[270px] lg:px-9 lg:py-10"
        >
          {/* Decorative phone image: tablet and desktop only */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[38%] lg:block lg:w-[40%]"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#191B21] via-[#191B21]/65 to-transparent" />

            <img
              src={phoneNews}
              alt=""
              className="absolute inset-y-0 right-0 h-full w-full object-contain object-right"
            />
          </div>

          {/* Newsletter content */}
          <div className="relative z-20 w-full sm:max-w-[76%] lg:max-w-[68%]">
            <h2
              id="newsletter-heading"
              className="font-heading text-xl font-bold leading-tight tracking-tight !text-white sm:text-2xl lg:text-3xl"
            >
              Get the latest deals and new arrivals
            </h2>

            <p className="mt-3 max-w-xl font-body text-sm leading-6 text-white/80 sm:text-base">
              Be the first to know about new phones, exclusive deals and special
              offers.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 flex min-h-[52px] w-full max-w-[500px] items-stretch rounded-xl bg-white p-1 sm:mt-7 sm:min-h-[56px]"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="Enter your email address"
                disabled={isSubmitting}
                className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 font-body text-sm text-ink outline-none placeholder:text-muted/80 focus:ring-2 focus:ring-inset focus:ring-accent disabled:opacity-60 sm:px-4"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-w-[100px]  shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 font-body text-sm font-semibold text-white transition-colors bg-[#f06428] hover:bg-[#d9511b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[120px] sm:px-6"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader aria-hidden="true" className="animate-spin" />
                    Subscribing
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            <div aria-live="polite" className="mt-3 min-h-5">
              {status === "success" && (
                <p className="flex items-center gap-2 font-body text-xs text-white/90">
                  <FiCheckCircle aria-hidden="true" />
                  Demo submitted. Newsletter integration is still needed.
                </p>
              )}

              {status === "error" && (
                <p className="font-body text-xs text-red-300">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
