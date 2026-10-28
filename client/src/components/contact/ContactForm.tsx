import { useState, type FormEvent } from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

const inputClassName =
  "mt-1.5 block w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15";

export default function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const body = [
      `Name: ${fullName.trim()}`,
      `Email: ${email.trim()}`,
      `Subject: ${subject}`,
      "",
      message.trim(),
    ].join("\n");

    const mailtoUrl = `mailto:support@ogimstore.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setFeedback(
      "Your email application should open with your message prepared. Please send it there to complete your enquiry.",
    );

    window.location.href = mailtoUrl;
  }

  return (
    <section
      aria-labelledby="contact-form-heading"
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-5 sm:p-7 lg:p-8"
    >
      <h2
        id="contact-form-heading"
        className="text-xl font-extrabold sm:text-2xl"
      >
        Send us a message
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        Fill in the form and tell us how we can help.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your name"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            Subject
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className={inputClassName}
          >
            <option value="" disabled>
              Select a subject
            </option>
            <option value="Product enquiry">Product enquiry</option>
            <option value="Order and delivery">Order and delivery</option>
            <option value="Payment issue">Payment issue</option>
            <option value="Returns and warranty">Returns and warranty</option>
            <option value="Technical support">Technical support</option>
            <option value="Other enquiry">Other enquiry</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="block text-sm font-semibold text-[var(--color-ink)]"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="How can we help you?"
            className={`${inputClassName} min-h-32 resize-y`}
          />
          <p className="mt-1 text-right text-xs text-[var(--color-muted)]">
            {message.length}/3000
          </p>
        </div>

        {feedback && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-success-soft)] p-3 text-sm leading-5 text-[var(--color-success)]"
          >
            <FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" />
            {feedback}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          Send message
          <FiArrowRight size={17} aria-hidden="true" />
        </button>

        <p className="text-xs leading-5 text-[var(--color-muted)]">
          This form opens your email application. Your message is not sent
          automatically by this website yet.
        </p>
      </form>
    </section>
  );
}
