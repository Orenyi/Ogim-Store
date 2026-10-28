import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from "react-icons/fi";
import visa from "../../assets/images/visa.png";
import mastercard from "../../assets/images/mastercard.png";
import verve from "../../assets/images/Verve_Logo.svg";
import paystack from "../../assets/images/paystack.png";

import ogimLogo from "../../assets/images/ogim_logo.webp";

type SocialLink = {
  label: string;
  href: string;
  icon: "instagram" | "facebook" | "x" | "youtube";
};

type FooterProps = {
  socialLinks?: SocialLink[];
  copyrightYear?: number;
};

const shopLinks = [
  { label: "All Phones", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Deals", to: "/deals" },
  { label: "Brands", to: "/brands" },
  { label: "By Condition", to: "/shop?condition=all" },
];

const supportLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "FAQs", to: "/faq" },
  { label: "Warranty & Returns", to: "/warranty-returns" },
  { label: "Shipping & Delivery", to: "/shipping" },
  { label: "Track Order", to: "/account/orders" },
];

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms" },
];

const paymentMethods = [
  { name: "Visa", src: visa, width: 48 },
  { name: "Mastercard", src: mastercard, width: 38 },
  { name: "Verve", src: verve, width: 48 },
  { name: "Payment provider", src: paystack, width: 32 },
];

const defaultSocialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "",
    icon: "instagram",
  },
  {
    label: "Facebook",
    href: "",
    icon: "facebook",
  },
  {
    label: "X",
    href: "",
    icon: "x",
  },
  {
    label: "YouTube",
    href: "",
    icon: "youtube",
  },
];

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  const iconProps = {
    size: 16,
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "instagram":
      return <FiInstagram {...iconProps} />;
    case "facebook":
      return <FiFacebook {...iconProps} />;
    case "x":
      return <FiTwitter {...iconProps} />;
    case "youtube":
      return <FiYoutube {...iconProps} />;
  }
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <nav aria-label={title} className="min-w-0">
      <h2 className="mb-3 text-sm font-bold text-[var(--color-ink)]">
        {title}
      </h2>

      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${link.label}-${link.to}`}>
            <Link
              to={link.to}
              className="text-xs leading-5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] sm:text-[13px]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer({
  socialLinks = defaultSocialLinks,
  copyrightYear = 2024,
}: FooterProps) {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-paper)]">
      <div className="page-container">
        {/* Main footer columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-10 sm:grid-cols-2 sm:gap-x-12 sm:py-12 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr] md:gap-8 lg:py-14">
          {/* Brand and social links */}
          <div className="col-span-2 min-w-0 md:col-span-1">
            <Link
              to="/"
              aria-label="Ogim Store homepage"
              className="inline-flex"
            >
              <img
                src={ogimLogo}
                alt="Ogim Store"
                className="w-[145px] object-contain sm:w-[160px]"
              />
            </Link>

            <p className="mt-3 max-w-xs text-xs leading-6 text-[var(--color-muted)] sm:text-sm">
              Quality phones for a better tomorrow.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => {
                const icon = <SocialIcon icon={social.icon} />;

                const className =
                  "grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--color-ink)] transition-colors hover:bg-[var(--color-stone)] hover:text-[var(--color-accent)]";

                return social.href ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Ogim Store on ${social.label}`}
                    className={className}
                  >
                    {icon}
                  </a>
                ) : (
                  <span
                    key={social.label}
                    aria-label={`${social.label} link to be configured`}
                    title={`${social.label} link to be configured`}
                    className={`${className} cursor-default`}
                  >
                    {icon}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Footer navigation */}
          <FooterLinkGroup title="Shop" links={shopLinks} />
          <FooterLinkGroup title="Support" links={supportLinks} />
          <FooterLinkGroup title="Company" links={companyLinks} />
        </div>

        {/* Copyright and payment methods */}

        {/* Copyright and payment methods */}
        <div className="flex flex-col gap-5 border-t border-[var(--color-border)] py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6">
          <p className="text-xs leading-5 text-[var(--color-muted)]">
            © {copyrightYear} Ogim Store. All rights reserved.
          </p>

          <div
            aria-label="Accepted payment methods"
            className="flex flex-wrap items-center gap-5 sm:gap-6"
          >
            {paymentMethods.map((method) => (
              <img
                key={method.name}
                src={method.src}
                alt={method.name}
                title={method.name}
                width={method.width}
                className="h-7 w-auto max-w-[52px] object-contain"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
