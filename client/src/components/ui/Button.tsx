
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { FiArrowRight, FiLoader } from "react-icons/fi";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  showArrow?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap " +
  "rounded-[10px] font-body text-sm font-semibold " +
  "transition-all duration-200 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:cursor-not-allowed " +
  "disabled:opacity-55";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--color-accent)] bg-[var(--color-accent)] " +
    "text-white shadow-sm " +
    "hover:border-[var(--color-accent-hover)] " +
    "hover:bg-[var(--color-accent-hover)] " +
    "active:scale-[0.98]",

  secondary:
    "border border-transparent bg-white text-[var(--color-ink)] " +
    "shadow-sm hover:bg-[var(--color-surface-muted)] " +
    "active:scale-[0.98]",

  outline:
    "border border-[var(--color-border-strong)] bg-transparent " +
    "text-[var(--color-ink)] hover:border-[var(--color-ink)] " +
    "hover:bg-white active:scale-[0.98]",

  ghost:
    "border border-transparent bg-transparent text-[var(--color-ink)] " +
    "hover:bg-[var(--color-stone)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4",
  lg: "min-h-12 px-5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      showArrow = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "w-fit",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? (
          <FiLoader
            className="h-4 w-4 shrink-0 animate-spin"
            aria-hidden="true"
          />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        <span>{children}</span>

        {!loading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {!loading && showArrow && !rightIcon && (
          <FiArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
