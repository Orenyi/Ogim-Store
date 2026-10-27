import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "size"
> {
  id: string;
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingAction?: ReactNode;
}

export default function FormField({
  id,
  label,
  error,
  leadingIcon,
  trailingAction,
  className = "",
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[var(--color-ink)]"
      >
        {label}
      </label>

      <div
        className={[
          "flex min-h-12 items-center gap-3 rounded-[var(--radius-control)]",
          "border bg-white px-3 transition-colors duration-150",
          "focus-within:border-[var(--color-accent)]",
          error
            ? "border-[var(--color-error)]"
            : "border-[var(--color-border-strong)]",
        ].join(" ")}
      >
        {leadingIcon && (
          <span
            aria-hidden="true"
            className="shrink-0 text-[var(--color-muted)]"
          >
            {leadingIcon}
          </span>
        )}

        <input
          {...inputProps}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : inputProps["aria-describedby"]}
          className={[
            "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none",
            "placeholder:text-[var(--color-muted)]",
            className,
          ].join(" ")}
        />

        {trailingAction && (
          <div className="flex shrink-0 items-center">{trailingAction}</div>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm leading-5 text-[var(--color-error)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
