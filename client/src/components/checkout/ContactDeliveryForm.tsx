import { useState, type FormEvent } from "react";
import { FiArrowLeft, FiArrowRight, FiMapPin } from "react-icons/fi";

import { useCheckout } from "../../context/CheckoutContext";

export interface ContactDeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  instructions: string;
}

interface ContactDeliveryFormProps {
  initialValues?: Partial<ContactDeliveryDetails>;
  onContinue: (details: ContactDeliveryDetails) => void;
  onBack?: () => void;
}

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory (FCT)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const emptyValues: ContactDeliveryDetails = {
  fullName: "",
  email: "",
  phone: "",
  state: "",
  city: "",
  address: "",
  instructions: "",
};

const inputClassName =
  "mt-1.5 block min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15";

const labelClassName = "block text-sm font-semibold text-[var(--color-ink)]";

function normalizeNigerianPhone(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

function isValidNigerianPhone(value: string): boolean {
  const phone = normalizeNigerianPhone(value);

  // Accepts 08031234567, 2348031234567, or +2348031234567.
  return /^(?:0[789]\d{9}|\+?234[789]\d{9})$/.test(phone);
}

export default function ContactDeliveryForm({
  initialValues,
  onContinue,
  onBack,
}: ContactDeliveryFormProps) {
  const { contactDetails, updateContactDetails } = useCheckout();

  // Shared checkout values are the source of truth.
  // Explicit initialValues can override them when supplied.
  const [values, setValues] = useState<ContactDeliveryDetails>(() => ({
    ...emptyValues,
    ...contactDetails,
    ...initialValues,
  }));

  const [phoneError, setPhoneError] = useState("");

  function updateField(field: keyof ContactDeliveryDetails, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    // Keep the shared checkout context synchronized with every edit.
    updateContactDetails({ [field]: value });

    if (field === "phone") {
      setPhoneError("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidNigerianPhone(values.phone)) {
      setPhoneError("Enter a valid Nigerian mobile number, e.g. 08031234567.");
      return;
    }

    setPhoneError("");

    const details: ContactDeliveryDetails = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: normalizeNigerianPhone(values.phone),
      state: values.state.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      instructions: values.instructions.trim(),
    };

    // Save the normalized details before moving to the next step.
    updateContactDetails(details);
    setValues(details);
    onContinue(details);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-2xl">
          Contact details
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          We’ll use this information to keep you updated about your order.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClassName} htmlFor="checkout-full-name">
            Full name
          </label>

          <input
            id="checkout-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            className={inputClassName}
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="checkout-email">
            Email address
          </label>

          <input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            maxLength={254}
            required
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="checkout-phone">
            Phone number
          </label>

          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08031234567"
            aria-invalid={Boolean(phoneError)}
            aria-describedby={
              phoneError ? "checkout-phone-error" : "checkout-phone-help"
            }
            className={[
              inputClassName,
              phoneError
                ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
                : "",
            ].join(" ")}
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            required
          />

          {phoneError ? (
            <p
              id="checkout-phone-error"
              role="alert"
              className="mt-1.5 text-xs text-[var(--color-error)]"
            >
              {phoneError}
            </p>
          ) : (
            <p
              id="checkout-phone-help"
              className="mt-1.5 text-xs text-[var(--color-muted)]"
            >
              Enter a Nigerian mobile number, with or without +234.
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 mt-8 flex items-center gap-3 border-t border-[var(--color-border)] pt-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiMapPin size={18} aria-hidden="true" />
        </span>

        <div>
          <h3 className="font-bold text-[var(--color-ink)]">
            Delivery address
          </h3>

          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Where should we deliver your order?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor="checkout-state">
            State
          </label>

          <select
            id="checkout-state"
            name="state"
            autoComplete="address-level1"
            className={inputClassName}
            value={values.state}
            onChange={(event) => updateField("state", event.target.value)}
            required
          >
            <option value="">Select state</option>

            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="checkout-city">
            City or town
          </label>

          <input
            id="checkout-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="e.g. Abuja"
            className={inputClassName}
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName} htmlFor="checkout-address">
            Full address
          </label>

          <input
            id="checkout-address"
            name="address"
            type="text"
            autoComplete="street-address"
            placeholder="House number, street name, area"
            className={inputClassName}
            value={values.address}
            onChange={(event) => updateField("address", event.target.value)}
            minLength={5}
            maxLength={250}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName} htmlFor="checkout-instructions">
            Delivery instructions{" "}
            <span className="font-normal text-[var(--color-muted)]">
              (optional)
            </span>
          </label>

          <textarea
            id="checkout-instructions"
            name="instructions"
            rows={3}
            maxLength={500}
            placeholder="Landmark, directions, or when to call"
            className={`${inputClassName} min-h-24 resize-y`}
            value={values.instructions}
            onChange={(event) =>
              updateField("instructions", event.target.value)
            }
          />
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            <FiArrowLeft size={16} aria-hidden="true" />
            Back to cart
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Continue to delivery method
          <FiArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
