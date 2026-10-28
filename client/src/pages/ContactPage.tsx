import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";

export default function ContactPage() {
  return (
    <main className="min-w-0 bg-[var(--color-paper)]">
      <div className="page-container py-8 sm:py-10 lg:py-14">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Contact us
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--color-muted)] sm:text-base sm:leading-7">
            We're here to help. Get in touch with our team for support,
            enquiries, or feedback.
          </p>
        </header>

        <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
