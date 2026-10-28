import type { ReactNode } from "react";
import { motion } from "framer-motion";
import AccountSidebar from "./AccountSidebar";

type AccountLayoutProps = {
  children: ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <main className="min-h-[70vh] bg-[var(--color-paper)]">
      <div className="page-container py-5 sm:py-7 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-7"
        >
          {/* Desktop account sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)]">
              <AccountSidebar />
            </div>
          </aside>

          {/* Account page content */}
          <section className="min-w-0" aria-label="Account content">
            {children}
          </section>
        </motion.div>
      </div>
    </main>
  );
}
