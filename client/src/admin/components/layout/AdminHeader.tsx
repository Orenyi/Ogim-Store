import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiBell, FiMenu } from "react-icons/fi";

import ogimLogo from "../../../assets/images/ogim_logo.webp";

type AdminHeaderProps = {
  onOpenMobileMenu: () => void;
  adminName?: string;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

export default function AdminHeader({
  onOpenMobileMenu,
  adminName = "Admin",
}: AdminHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const greeting = getGreeting();

  const adminInitials =
    adminName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--color-border)] bg-[var(--color-paper)]/95 backdrop-blur-md">
      {/* Main header row */}
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[76px] lg:px-8">
        {/* Mobile brand and menu */}
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <FiMenu size={21} />
          </button>

          <img
            src={ogimLogo}
            alt="Ogim Store"
            className="h-8 max-w-[145px] object-contain"
          />
        </div>

        {/* Desktop greeting */}
        <div className="hidden min-w-0 lg:block">
          <h1 className="font-heading text-[25px] font-extrabold tracking-[-0.045em] text-[var(--color-ink)] xl:text-[28px]">
            {greeting}, {adminName}
          </h1>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Here's what's happening at Ogim Store today.
          </p>
        </div>

        {/* Header actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <FiBell size={19} />

              {/* Notification indicator - will be connected to real notifications later */}
              <span className="absolute right-[9px] top-[8px] h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--color-accent)]" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-32px))] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-dropdown)]"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-[var(--color-ink)]">
                        Notifications
                      </h3>

                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                      >
                        Close
                      </button>
                    </div>

                    <div className="py-8 text-center">
                      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                        <FiBell size={20} />
                      </span>

                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        You're all caught up
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        New store notifications will appear here.
                      </p>
                    </div>
                  </motion.div>

                  {/* Close dropdown when clicking outside */}
                  <button
                    type="button"
                    aria-label="Close notifications"
                    className="fixed inset-0 z-[-1] cursor-default"
                    onClick={() => setNotificationsOpen(false)}
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Admin avatar */}
          <button
            type="button"
            aria-label={`${adminName} profile`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white transition-transform hover:scale-105"
          >
            {adminInitials}
          </button>
        </div>
      </div>

      {/* Mobile greeting */}
      <div className="px-4 pb-4 lg:hidden sm:px-6">
        <h1 className="font-heading text-[21px] font-extrabold tracking-[-0.045em] text-[var(--color-ink)]">
          {greeting}, {adminName}
        </h1>

        <p className="mt-1 text-xs text-[var(--color-muted)] sm:text-sm">
          Here's what's happening at Ogim Store today.
        </p>
      </div>
    </header>
  );
}
