import { useToast } from "../components/ui/ToastProvider";

export default function ToastPreview() {
  const toast = useToast();

  return (
    <div className="flex flex-wrap gap-3 p-6">
      <button
        onClick={() => toast.success("Product added to cart.")}
        className="rounded-[var(--radius-control)] bg-[var(--color-success)] px-4 py-2 text-white"
      >
        Success
      </button>

      <button
        onClick={() => toast.error("Something went wrong.")}
        className="rounded-[var(--radius-control)] bg-[var(--color-error)] px-4 py-2 text-white"
      >
        Error
      </button>

      <button
        onClick={() => toast.warning("Only 2 items remain.")}
        className="rounded-[var(--radius-control)] bg-[var(--color-warning)] px-4 py-2 text-white"
      >
        Warning
      </button>

      <button
        onClick={() => toast.info("Your wishlist was updated.")}
        className="rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2 text-white"
      >
        Info
      </button>
    </div>
  );
}
