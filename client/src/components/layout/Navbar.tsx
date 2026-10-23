import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";

import ogimLogo from "../../assets/images/ogim_logo.webp";
import MobileMenu from "./MobileMenu";

type NavbarProps = {
  cartCount?: number;
  isAuthenticated?: boolean;
};

const desktopLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Brands", to: "/brands" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Deals", to: "/deals" },
];

export default function Navbar({
  cartCount = 0,
  isAuthenticated = false,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="relative z-[30] w-full border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto flex h-[64px] w-full max-w-[var(--container-max)] items-center gap-3 px-3 sm:px-6 lg:h-[76px] lg:gap-6">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="ogim-mobile-menu"
            className="grid h-9 w-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-[var(--color-paper)] md:hidden"
          >
            <FiMenu size={21} aria-hidden="true" />
          </button>

          {/* Store logo */}
          <Link to="/" aria-label="Ogim Store homepage" className="shrink-0">
            <img
              src={ogimLogo}
              alt="Ogim Store"
              className="w-[102px] object-contain sm:w-[120px] lg:w-[130px]"
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6"
          >
            {desktopLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap text-[11px] font-semibold",
                    "transition-colors hover:text-[var(--color-accent)]",
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-ink)]",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop search */}
          <form
            role="search"
            onSubmit={submitSearch}
            className="ml-auto hidden h-10 min-w-0 max-w-[360px] flex-1 items-center gap-2 rounded-full border border-transparent bg-[var(--color-paper)] px-4 transition-colors focus-within:border-[var(--color-accent)] md:flex"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for iPhone, Samsung..."
              aria-label="Search phones"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--color-muted)]"
            />

            <button
              type="submit"
              aria-label="Search"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-accent)]"
            >
              <FiSearch size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Account and cart */}
          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 md:gap-2">
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              aria-label={isAuthenticated ? "My account" : "Sign in"}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[var(--color-paper)]"
            >
              <FiUser size={19} aria-hidden="true" />
            </Link>

            <Link
              to="/cart"
              aria-label={`Shopping cart, ${cartCount} items`}
              className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[var(--color-paper)]"
            >
              <FiShoppingCart size={19} aria-hidden="true" />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[9px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
