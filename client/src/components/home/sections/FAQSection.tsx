import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiMessageSquare,
  FiPhone,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "2349031496617";
const DISPLAY_PHONE_NUMBER = "0903 149 6617";

const faqs = [
  {
    question: "Are the phones original?",
    answer:
      "Yes. Ogim Store aims to sell genuine devices sourced from trusted suppliers. Product listings identify the phone's condition as brand-new, UK-used, or refurbished so you can make an informed choice. Please contact us if you need additional verification for a specific device.",
  },
  {
    question: "Do you offer warranty?",
    answer:
      "Warranty coverage depends on the phone and its condition. Please check the individual product listing or contact our team before ordering to confirm the warranty period, coverage, and applicable terms.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Available payment methods will be shown during checkout. We plan to support secure online payments through Paystack. Never share your card PIN or banking password with anyone claiming to represent Ogim Store.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location, order confirmation, and product availability. Contact our team with your delivery location for an estimated delivery time before placing your order.",
  },
  {
    question: "Can I return a phone?",
    answer:
      "Returns are subject to Ogim Store's return policy and the condition of the item. Please contact our support team before returning a product so we can confirm eligibility, the return window, and the next steps.",
  },
];

const whatsappMessage = encodeURIComponent(
  "Hello Ogim Store, I have a question about your phones.",
);

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-heading" className="py-12 sm:py-14 lg:py-20">
      <div className="page-container">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12 xl:gap-16">
          {/* Frequently asked questions */}
          <div>
            <h2
              id="faq-heading"
              className="mb-6 font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl lg:mb-7 lg:text-3xl"
            >
              Common questions
            </h2>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const answerId = `faq-answer-${index}`;
                const triggerId = `faq-question-${index}`;

                return (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.045,
                    }}
                    className={[
                      "overflow-hidden rounded-xl border bg-white",
                      isOpen ? "border-accent/40" : "border-stone",
                    ].join(" ")}
                  >
                    <h3>
                      <button
                        id={triggerId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex min-h-[54px] w-full items-center justify-between gap-4 px-4 py-3 text-left font-body text-sm font-medium text-ink transition-colors hover:bg-[#FAF8F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:min-h-[58px] sm:px-5"
                      >
                        <span>{faq.question}</span>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex shrink-0 items-center justify-center text-muted"
                        >
                          <FiChevronDown aria-hidden="true" size={18} />
                        </motion.span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={answerId}
                          role="region"
                          aria-labelledby={triggerId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: {
                              duration: 0.25,
                              ease: "easeInOut",
                            },
                            opacity: { duration: 0.18 },
                          }}
                          className="overflow-hidden"
                        >
                          <p className="border-t border-stone/70 px-4 py-4 font-body text-sm leading-6 text-muted sm:px-5">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Contact support card */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            aria-labelledby="faq-support-heading"
            className="rounded-2xl bg-[#F3F0E9] p-5 sm:p-7 lg:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white ring-4 ring-[var(--color-accent)] sm:h-[72px] sm:w-[72px]">
                <FiMessageSquare
                  aria-hidden="true"
                  size={29}
                  strokeWidth={1.8}
                  className="text-[var(--color-accent)]"
                />
              </div>

              <h2
                id="faq-support-heading"
                className="font-heading text-lg font-bold text-ink sm:text-xl"
              >
                Still have questions?
              </h2>

              <p className="mt-1 font-body text-sm leading-6 text-muted sm:text-base">
                Our team is ready to help you.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-[#EAF7EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <FaWhatsapp
                  aria-hidden="true"
                  className="shrink-0 text-[#198754]"
                  size={21}
                />
                <span>Chat on WhatsApp</span>
                <FiArrowUpRight
                  aria-hidden="true"
                  className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  size={16}
                />
              </a>

              <a
                href="tel:+2349031496617"
                className="group flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-[#FAEEE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <FiPhone
                  aria-hidden="true"
                  className="shrink-0 text-accent"
                  size={19}
                />
                <span>Call {DISPLAY_PHONE_NUMBER}</span>
                <FiArrowUpRight
                  aria-hidden="true"
                  className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  size={16}
                />
              </a>
            </div>

            <p className="mt-4 text-center font-body text-xs leading-5 text-muted">
              Reach out for help with products, orders, and delivery.
            </p>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
