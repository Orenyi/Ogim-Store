import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiShoppingCart, FiUser, FiX } from "react-icons/fi";

import ogimLogo from "../../assets/images/ogim_logo.webp";
import MobileMenu from "./MobileMenu";
import SearchSuggestions from "../search/SearchSuggestions";
import { useAuth } from "../../context/AuthContext";

type NavbarProps = {
  cartCount?: number;
};

const desktopLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Brands", to: "/shop?brands=all" },
  { label: "New Arrivals", to: "/shop?condition=new" },
  { label: "Deals", to: "/shop?sort=price-low" },
];

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    setIsSearchFocused(false);
    setIsMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <header className="relative z-[30] w-full border-b border-[var(--color-border)] bg-white">
        <div className="page-container mx-auto flex h-[64px] w-full items-center gap-3 px-3 sm:px-6 lg:h-[76px] lg:gap-6">
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
          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6"
          >
            {desktopLinks.map(({ label, to }) => {
              const isActive =
                label === "Shop"
                  ? location.pathname === "/shop" &&
                    !location.search.includes("brands=all") &&
                    !location.search.includes("condition=new") &&
                    !location.search.includes("sort=price-low") &&
                    !location.search.includes("brand=") &&
                    !location.search.includes("condition=") &&
                    !location.search.includes("sort=")
                  : label === "Brands"
                    ? location.pathname === "/shop" &&
                      new URLSearchParams(location.search).get("brands") ===
                        "all"
                    : label === "New Arrivals"
                      ? location.pathname === "/shop" &&
                        new URLSearchParams(location.search).get(
                          "condition",
                        ) === "new"
                      : label === "Deals"
                        ? location.pathname === "/shop" &&
                          new URLSearchParams(location.search).get("sort") ===
                            "price-low"
                        : false;

              return (
                <NavLink
                  key={label}
                  to={to}
                  className={[
                    "whitespace-nowrap text-[11px] font-semibold",
                    "transition-colors hover:text-[var(--color-accent)]",
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-ink)]",
                  ].join(" ")}
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop search with suggestions */}
          <div
            ref={searchWrapperRef}
            className="relative ml-auto hidden min-w-0 max-w-[360px] flex-1 md:block"
          >
            <form
              role="search"
              onSubmit={submitSearch}
              className={[
                "flex h-10 items-center gap-2 rounded-full border bg-[var(--color-paper)] px-4 transition-colors",
                isSearchFocused
                  ? "border-[var(--color-accent)]"
                  : "border-transparent",
              ].join(" ")}
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchFocused(false);
                  }
                }}
                placeholder="Search for iPhone, Samsung..."
                aria-label="Search phones"
                aria-expanded={isSearchFocused && Boolean(searchQuery.trim())}
                aria-controls="navbar-search-suggestions"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--color-muted)]"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                >
                  <FiX size={14} aria-hidden="true" />
                </button>
              )}

              <button
                type="submit"
                aria-label="Search"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-accent)]"
              >
                <FiSearch size={16} aria-hidden="true" />
              </button>
            </form>

            {isSearchFocused && searchQuery.trim() && (
              <div id="navbar-search-suggestions">
                <SearchSuggestions query={searchQuery} />
              </div>
            )}
          </div>

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
