import type { IconType } from "react-icons";

type ContactInfoCardProps = {
  icon: IconType;
  title: string;
  details: string;
  note?: string;
  iconClassName?: string;
  href?: string;
};

export default function ContactInfoCard({
  icon: Icon,
  title,
  details,
  note,
  iconClassName = "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  href,
}: ContactInfoCardProps) {
  const content = (
    <>
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] ${iconClassName}`}
      >
        <Icon size={19} aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[var(--color-ink)]">
          {title}
        </span>
        <span className="mt-0.5 block break-words text-sm text-[var(--color-muted)]">
          {details}
        </span>
        {note && (
          <span className="mt-0.5 block text-xs leading-5 text-[var(--color-muted)]">
            {note}
          </span>
        )}
      </span>
    </>
  );

  const className =
    "flex min-w-0 items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 transition-colors hover:border-[var(--color-border-strong)]";

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
