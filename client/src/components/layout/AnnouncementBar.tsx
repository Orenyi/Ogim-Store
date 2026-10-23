import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

type AnnouncementBarProps = {
  messages?: string[];
  supportLabel?: string;
  supportHref?: string;
};

const DEFAULT_MESSAGES = [
  "100% Genuine Phones",
  "Secure Payments",
  "Nationwide Delivery",
];

export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  supportLabel = "Need help?",
  supportHref = "/contact",
}: AnnouncementBarProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (messages.length === 0) {
    return null;
  }

  const activeMessage = messages[activeIndex % messages.length];

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? messages.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % messages.length);
  }

  return (
    <div className="relative z-[31] border-b border-white/30 bg-[var(--color-accent)] text-white">
      <div className="mx-auto flex h-[34px] w-full max-w-[var(--container-max)] items-center justify-between gap-3 px-3 sm:px-6">
        {/* Desktop announcements */}
        <div className="hidden min-w-0 items-center gap-2 text-[10px] font-medium leading-none lg:flex">
          {messages.map((message, index) => (
            <span
              key={`${message}-${index}`}
              className="inline-flex shrink-0 items-center gap-2"
            >
              {index > 0 && (
                <span aria-hidden="true" className="text-white/70">
                  •
                </span>
              )}

              <span>{message}</span>
            </span>
          ))}
        </div>

        {/* Tablet and mobile announcement carousel */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous announcement"
            disabled={messages.length < 2}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15 disabled:opacity-40"
          >
            <FiChevronLeft size={14} aria-hidden="true" />
          </button>

          <div
            className="min-w-0 flex-1 overflow-hidden text-center text-[10px] font-medium leading-none"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeMessage}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.16 }}
                className="block truncate"
              >
                {activeMessage}
              </motion.span>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={showNext}
            aria-label="Next announcement"
            disabled={messages.length < 2}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15 disabled:opacity-40"
          >
            <FiChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Desktop support link */}
        <Link
          to={supportHref}
          className="hidden shrink-0 items-center gap-2 text-[10px] font-semibold leading-none transition-opacity hover:opacity-80 lg:inline-flex"
        >
          {supportLabel}
          <span className="font-medium">0903 149 6617</span>
        </Link>
      </div>
    </div>
  );
}
