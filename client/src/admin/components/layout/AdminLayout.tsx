import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminMobileNav from "./AdminMobileNav";
import AdminMobileMenu from "./AdminMobileMenu";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  // Close the mobile menu whenever the user changes pages.
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((previous) => !previous)}
        />

        {/* Main application */}
        <div className="min-w-0 flex-1">
          <AdminHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            adminName="Ogim Admin"
          />

          <main
            key={location.pathname}
            className="min-h-[calc(100vh-76px)] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8"
          >
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <AdminMobileNav onOpenMore={() => setMobileMenuOpen(true)} />

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileMenuOpen && <AdminMobileMenu onClose={closeMobileMenu} />}
      </AnimatePresence>
    </div>
  );
}
