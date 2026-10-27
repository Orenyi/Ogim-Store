import { useState, type FormEvent } from "react";
import { FiTag } from "react-icons/fi";
import { useToast } from "../ui/ToastProvider";

interface CartPromoCodeProps {
  onApplyCode?: (code: string) => void | Promise<void>;
  disabled?: boolean;
}

export default function CartPromoCode({
  onApplyCode,
  disabled = false,
}: CartPromoCodeProps) {
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const toast = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      toast.warning("Enter a promo code to continue.");
      return;
    }

    if (disabled || isApplying) return;

    if (!onApplyCode) {
      toast.info(
        "Promo-code validation will be available when promotions are connected.",
      );
      return;
    }

    setIsApplying(true);

    try {
      await onApplyCode(normalizedCode);
    } catch {
      toast.error("We couldn't apply this code. Please try again.");
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <section
      aria-labelledby="cart-promo-heading"
      className="border-t border-[var(--color-border)] pt-4"
    >
      <h3
        id="cart-promo-heading"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <FiTag size={16} aria-hidden="true" />
        Have a promo code?
      </h3>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="cart-promo-code" className="sr-only">
          Promo code
        </label>

        <input
          id="cart-promo-code"
          name="promoCode"
          type="text"
          autoComplete="off"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter code"
          disabled={disabled || isApplying}
          maxLength={50}
          className="h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm uppercase outline-none transition-colors placeholder:normal-case focus:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)]"
        />

        <button
          type="submit"
          disabled={disabled || isApplying}
          className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 text-sm font-semibold transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-stone)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApplying ? "Applying…" : "Apply"}
        </button>
      </form>
    </section>
  );
}
