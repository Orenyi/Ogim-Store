import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowRight,
  FiChevronRight,
  FiHome,
  FiSmartphone,
  FiTag,
  FiTrendingUp,
  FiUser,
  FiX,
  FiSearch,
} from "react-icons/fi";

import ogimLogo from "../../assets/images/ogim_logo.webp";
import SearchSuggestions from "../search/SearchSuggestions";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
};

const menuItems = [
  { label: "Home", to: "/", icon: FiHome },
  { label: "Shop all phones", to: "/shop", icon: FiSmartphone },
  { label: "Brands", to: "/brands", icon: FiTag },
  { label: "New arrivals", to: "/new-arrivals", icon: FiTrendingUp },
  { label: "Deals", to: "/deals", icon: FiTag },
];

export default function MobileMenu({
  isOpen,
  onClose,
  isAuthenticated = false,
}: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        setSearchFocused(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchFocused(false);
    }
  }, [isOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    setSearchFocused(false);
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-[40] cursor-default bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            id="ogim-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-y-0 left-0 z-[50] flex w-[min(86vw,360px)] flex-col overflow-y-auto bg-white shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.28,
              ease: [0.2, 0, 0, 1],
            }}
          >
            {/* Drawer header */}
            <div className="flex min-h-[68px] items-center justify-between border-b border-[var(--color-border)] px-5">
              <Link to="/" onClick={onClose} aria-label="Ogim Store home">
                <img
                  src={ogimLogo}
                  alt="Ogim Store"
                  className="w-[120px] object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
              >
                <FiX size={21} aria-hidden="true" />
              </button>
            </div>

            {/* Mobile search and suggestions */}
            <div ref={searchWrapperRef} className="relative mx-5 mt-5">
              <form
                role="search"
                onSubmit={submitSearch}
                className={[
                  "flex h-11 items-center gap-2 rounded-[var(--radius-control)] border bg-[var(--color-paper)] px-3 transition-colors",
                  searchFocused
                    ? "border-[var(--color-accent)]"
                    : "border-[var(--color-border)]",
                ].join(" ")}
              >
                <FiSearch
                  size={17}
                  className="shrink-0 text-[var(--color-muted)]"
                  aria-hidden="true"
                />

                <label htmlFor="mobile-menu-search" className="sr-only">
                  Search phones
                </label>

                <input
                  id="mobile-menu-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search phones..."
                  aria-expanded={searchFocused && Boolean(searchQuery.trim())}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                  >
                    <FiX size={15} aria-hidden="true" />
                  </button>
                )}

                <button
                  type="submit"
                  aria-label="Submit search"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                >
                  <FiSearch size={16} aria-hidden="true" />
                </button>
              </form>

              {searchFocused && searchQuery.trim() && (
                <div className="absolute inset-x-0 top-full z-[60] mt-2">
                  <SearchSuggestions
                    query={searchQuery}
                    mobile
                    onSelect={() => {
                      setSearchFocused(false);
                      onClose();
                    }}
                  />
                </div>
              )}
            </div>

            {/* Main navigation */}
            <nav aria-label="Mobile navigation" className="px-3 py-5">
              <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Explore Ogim Store
              </p>

              <div className="space-y-1">
                {menuItems.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        "flex min-h-12 items-center gap-3 rounded-xl px-3",
                        "text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-paper)]",
                      ].join(" ")
                    }
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="flex-1">{label}</span>
                    <FiChevronRight
                      size={16}
                      className="text-[var(--color-muted)]"
                      aria-hidden="true"
                    />
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Account */}
            <div className="mx-5 border-t border-[var(--color-border)] pt-4">
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                onClick={onClose}
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-[var(--color-paper)]"
              >
                <FiUser size={18} aria-hidden="true" />
                <span className="flex-1">
                  {isAuthenticated ? "My account" : "Sign in / Register"}
                </span>
                <FiArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Trust footer */}
            <div className="mt-auto bg-[var(--color-paper)] p-5">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                Shop with confidence
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                Genuine phones, secure payments and nationwide delivery.
              </p>
              <Link
                to="/contact"
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--color-accent)]"
              >
                Need help? Contact us
                <FiArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
