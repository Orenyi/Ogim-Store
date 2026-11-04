import { useEffect, useState } from "react";
import { FiTruck, FiSave, FiInfo } from "react-icons/fi";
import type { DeliverySettings } from "../../types/delivery.types";
import { formatDeliveryCurrency } from "../../utils/delivery.utils";
import type { FormEvent } from "react";

type Props = {
  settings: DeliverySettings;
  onSave: (settings: DeliverySettings) => void;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-stone)]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function DeliverySettingsForm({ settings, onSave }: Props) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function update<K extends keyof DeliverySettings>(
    key: K,
    value: DeliverySettings[K],
  ) {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      form.defaultFee < 0 ||
      form.expressDeliveryFee < 0 ||
      (form.freeDeliveryThreshold !== null && form.freeDeliveryThreshold < 0)
    ) {
      return;
    }

    onSave(form);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <FiTruck size={20} />
          </span>
          <div>
            <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
              General delivery settings
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Set the default delivery pricing and estimated delivery window.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--color-ink)]">
            Default delivery fee (₦)
            <input
              type="number"
              min="0"
              step="100"
              value={form.defaultFee}
              onChange={(event) =>
                update("defaultFee", Number(event.target.value))
              }
              className={inputClass}
            />
            <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
              {formatDeliveryCurrency(form.defaultFee || 0)}
            </span>
          </label>

          <label className="text-sm font-semibold text-[var(--color-ink)]">
            Free delivery threshold (₦)
            <input
              type="number"
              min="0"
              step="1000"
              value={form.freeDeliveryThreshold ?? ""}
              onChange={(event) =>
                update(
                  "freeDeliveryThreshold",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              placeholder="Leave empty to disable"
              className={inputClass}
            />
            <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
              {form.freeDeliveryThreshold === null
                ? "Free delivery threshold is disabled."
                : `Orders above ${formatDeliveryCurrency(form.freeDeliveryThreshold)} qualify.`}
            </span>
          </label>

          <label className="text-sm font-semibold text-[var(--color-ink)] sm:col-span-2">
            Default estimated delivery
            <input
              value={form.defaultEstimatedDelivery}
              onChange={(event) =>
                update("defaultEstimatedDelivery", event.target.value)
              }
              placeholder="e.g. 2 – 3 days"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
          Delivery options
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Choose which delivery methods customers can select at checkout.
        </p>

        <div className="mt-3 divide-y divide-[var(--color-border)]">
          <Toggle
            checked={form.allowStandardDelivery}
            onChange={(value) => update("allowStandardDelivery", value)}
            label="Standard delivery"
            description="Allow customers to select standard delivery."
          />

          <Toggle
            checked={form.allowExpressDelivery}
            onChange={(value) => update("allowExpressDelivery", value)}
            label="Express delivery"
            description="Offer a faster delivery option where available."
          />
        </div>

        {form.allowExpressDelivery && (
          <label className="mt-4 block text-sm font-semibold text-[var(--color-ink)]">
            Express delivery fee (₦)
            <input
              type="number"
              min="0"
              step="100"
              value={form.expressDeliveryFee}
              onChange={(event) =>
                update("expressDeliveryFee", Number(event.target.value))
              }
              className={inputClass}
            />
          </label>
        )}
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-xs leading-5 text-[var(--color-muted)]">
        <FiInfo className="mt-0.5 shrink-0" size={15} />
        These are default settings. A location-specific delivery fee takes
        precedence when a matching active location is configured.
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {saved && (
          <span className="text-sm font-semibold text-[var(--color-success)]">
            Settings updated in this session.
          </span>
        )}
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
        >
          <FiSave size={16} />
          Save Settings
        </button>
      </div>
    </form>
  );
}
