import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ContactInfoCard from "./ContactInfoCard";

export default function ContactInfo() {
  return (
    <section aria-labelledby="contact-info-heading">
      <h2
        id="contact-info-heading"
        className="text-xl font-extrabold sm:text-2xl"
      >
        Contact information
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
        Choose the easiest way to reach our team.
      </p>

      <div className="mt-5 grid gap-3">
        <ContactInfoCard
          icon={FiMail}
          title="Email"
          details="support@ogimstore.com"
          note="We aim to reply within 24 hours."
          href="mailto:support@ogimstore.com"
        />

        <ContactInfoCard
          icon={FiPhone}
          title="Phone"
          details="+234 803 149 6617"
          note="Monday – Saturday, 9 AM – 6 PM"
          href="tel:+2348031496617"
        />

        <ContactInfoCard
          icon={FaWhatsapp}
          title="WhatsApp"
          details="Chat with us on WhatsApp"
          note="For quick questions and support."
          iconClassName="bg-[var(--color-success-soft)] text-[var(--color-success)]"
          href="https://wa.me/2348031496617"
        />

        <ContactInfoCard
          icon={FiMapPin}
          title="Visit by appointment"
          details="Gwarinpa, Abuja, FCT, Nigeria"
          note="Please contact us before visiting."
        />
      </div>
    </section>
  );
}
