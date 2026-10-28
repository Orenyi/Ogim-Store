const sections = [
  { id: "information-we-collect", title: "Information we collect" },
  { id: "how-we-use-information", title: "How we use your information" },
  {
    id: "how-we-protect-information",
    title: "How we protect your information",
  },
  { id: "sharing-information", title: "Sharing your information" },
  { id: "your-rights", title: "Your privacy rights" },
  { id: "cookies", title: "Cookies and similar technologies" },
  { id: "third-party-services", title: "Third-party services" },
  { id: "policy-changes", title: "Changes to this policy" },
  { id: "contact-us", title: "Contact us" },
];

export default function PrivacyTableOfContents() {
  return (
    <nav
      aria-labelledby="privacy-contents-heading"
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-6"
    >
      <h2
        id="privacy-contents-heading"
        className="mb-4 text-lg font-extrabold sm:text-xl"
      >
        In this policy
      </h2>

      <ol className="divide-y divide-[var(--color-border)]">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex items-start gap-3 rounded-[var(--radius-control)] px-2 py-3 transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <span className="w-6 shrink-0 text-sm font-bold text-[var(--color-accent)]">
                {index + 1}.
              </span>

              <span className="text-sm font-medium leading-6 text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]">
                {section.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
