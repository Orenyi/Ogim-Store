import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "new"
  | "used"
  | "refurbished"
  | "success"
  | "warning"
  | "error"
  | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
  size?: "sm" | "md";
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-muted)] text-[var(--color-ink)]",
  new: "bg-[var(--color-surface-muted)] text-[var(--color-ink)]",
  used: "bg-[var(--color-accent-soft)] text-[#9A3912]",
  refurbished: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  info: "bg-[#EAF2FF] text-[#2456A6]",
};

export default function Badge({
  variant = "default",
  size = "sm",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center justify-center rounded-full",
        "font-body font-semibold leading-tight",
        size === "sm" ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
