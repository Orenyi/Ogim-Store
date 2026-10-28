import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function PolicySection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 border-b border-[var(--color-border)] py-7 first:pt-0 last:border-b-0"
    >
      <h2
        id={`${id}-heading`}
        className="text-xl font-extrabold leading-snug sm:text-2xl"
      >
        <span className="mr-2 text-[var(--color-accent)]">{number}.</span>
        {title}
      </h2>

      <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyContent() {
  return (
    <article className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
      <PolicySection
        id="information-we-collect"
        number={1}
        title="Information we collect"
      >
        <p>
          We may collect information you provide when you create an account,
          place an order, contact our support team, or otherwise interact with
          Ogim Store.
        </p>

        <h3 className="text-base font-bold text-[var(--color-ink)]">
          Information you provide
        </h3>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>
            <strong className="text-[var(--color-ink)]">
              Identity and contact details:
            </strong>{" "}
            your name, email address, phone number, and delivery address.
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">
              Account information:
            </strong>{" "}
            the details required to register and manage your account.
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">
              Order information:
            </strong>{" "}
            the products you purchase, order references, delivery preferences,
            and transaction status.
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">
              Messages and enquiries:
            </strong>{" "}
            information you provide when you contact us about a product,
            delivery, return, refund, or other issue.
          </li>
        </ul>

        <h3 className="text-base font-bold text-[var(--color-ink)]">
          Information collected when you use the website
        </h3>
        <p>
          Depending on the features enabled on our website, technical
          information such as your IP address, browser type, device information,
          pages visited, and website activity may be collected through server
          logs, cookies, or analytics tools.
        </p>

        <p>
          We do not intend to collect information that is unnecessary for
          operating our store, processing orders, providing support, or meeting
          applicable legal obligations.
        </p>
      </PolicySection>

      <PolicySection
        id="how-we-use-information"
        number={2}
        title="How we use your information"
      >
        <p>
          We use personal information for legitimate business purposes related
          to providing and improving your shopping experience, including to:
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Create and manage your customer account.</li>
          <li>Process orders and coordinate payment and delivery.</li>
          <li>
            Send order confirmations, delivery updates, and important service
            notifications.
          </li>
          <li>
            Respond to questions, complaints, return requests, and refund
            enquiries.
          </li>
          <li>
            Maintain store security, identify suspicious activity, and help
            prevent fraud.
          </li>
          <li>
            Improve our website, product information, customer service, and
            shopping experience.
          </li>
          <li>
            Meet applicable legal, tax, accounting, and regulatory obligations.
          </li>
          <li>
            Send promotional messages where permitted and, where required, with
            your consent.
          </li>
        </ul>

        <p>
          We aim to use information only for purposes that are relevant to the
          reason it was collected or another lawful and compatible purpose.
        </p>
      </PolicySection>

      <PolicySection
        id="how-we-protect-information"
        number={3}
        title="How we protect your information"
      >
        <p>
          Protecting customer information is important to us. Appropriate
          safeguards should be used to help prevent unauthorised access,
          disclosure, alteration, loss, or misuse of personal information.
        </p>

        <p>
          Depending on the systems used to operate the store, these safeguards
          may include:
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Secure connections when information is transmitted.</li>
          <li>
            Access restrictions for systems containing customer information.
          </li>
          <li>Authentication and account-security measures.</li>
          <li>
            Updates, monitoring, backups, and appropriate security reviews.
          </li>
          <li>Using payment providers to process payments where supported.</li>
        </ul>

        <p>
          No website, network, or storage system can be guaranteed to be
          completely secure. If a personal-data incident occurs, we will take
          the steps required by applicable law.
        </p>

        <p>
          You should also protect your account credentials and avoid sharing
          your password, card PIN, or one-time password with anyone.
        </p>
      </PolicySection>

      <PolicySection
        id="sharing-information"
        number={4}
        title="Sharing your information"
      >
        <p>
          We do not intend to sell customers' personal information. We may share
          information where necessary to provide our services, protect
          customers, or comply with legal obligations.
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>
            <strong className="text-[var(--color-ink)]">
              Payment providers:
            </strong>{" "}
            to process transactions and help confirm payment status.
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">
              Delivery partners:
            </strong>{" "}
            to fulfil orders and deliver products to the address you provide.
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">
              Technology and service providers:
            </strong>{" "}
            to host our website, support customer communications, maintain
            systems, or provide analytics where enabled.
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">
              Professional advisers and authorities:
            </strong>{" "}
            where reasonably necessary to comply with the law, respond to lawful
            requests, resolve disputes, or protect rights and safety.
          </li>
        </ul>

        <p>
          Service providers should receive only the information reasonably
          needed to perform their assigned services and should be subject to
          appropriate confidentiality and data-protection requirements.
        </p>

        <p>
          If a business restructuring or transfer affects customer information,
          we will handle that information in accordance with applicable law.
        </p>
      </PolicySection>

      <PolicySection id="your-rights" number={5} title="Your privacy rights">
        <p>
          Depending on applicable law and the circumstances of your request, you
          may have the right to:
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Request access to the personal information we hold about you.</li>
          <li>Ask us to correct inaccurate or incomplete information.</li>
          <li>
            Request deletion of information where applicable law permits it.
          </li>
          <li>
            Object to, or request restrictions on, certain processing
            activities.
          </li>
          <li>Withdraw consent where processing relies on your consent.</li>
          <li>
            Request a copy of eligible information in a portable format, where
            applicable.
          </li>
          <li>Opt out of marketing communications.</li>
          <li>
            Raise a complaint with the relevant data-protection authority.
          </li>
        </ul>

        <p>
          These rights are subject to legal conditions and exceptions. For
          example, we may need to retain certain order, transaction, or tax
          records where required by law or needed to resolve a dispute.
        </p>

        <p>
          To make a privacy request, contact us using the details in the{" "}
          <Link
            to="/contact"
            className="font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            Contact us
          </Link>{" "}
          section. We may need to verify your identity before acting on the
          request.
        </p>
      </PolicySection>

      <PolicySection
        id="cookies"
        number={6}
        title="Cookies and similar technologies"
      >
        <p>
          Cookies are small files stored on your device when you visit a
          website. Depending on the technologies enabled on Ogim Store, cookies
          or similar tools may be used to:
        </p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Keep essential website features working.</li>
          <li>
            Remember preferences and maintain shopping-cart functionality.
          </li>
          <li>
            Understand website performance and usage where analytics are
            enabled.
          </li>
          <li>
            Support advertising or campaign measurement if such tools are used.
          </li>
        </ul>

        <p>
          Essential technologies may be needed for the website to function.
          Where required, we will request consent before using non-essential
          cookies or similar technologies.
        </p>

        <p>
          You can manage cookies through your browser settings. Blocking some
          cookies may affect features such as account access or the shopping
          cart. The exact cookies used will depend on the services enabled on
          the live website.
        </p>
      </PolicySection>

      <PolicySection
        id="third-party-services"
        number={7}
        title="Third-party services"
      >
        <p>
          Ogim Store may rely on third-party services for payments, delivery,
          website hosting, customer support, security, or analytics. When you
          use these features, relevant information may be processed by those
          providers to deliver their services.
        </p>

        <p>
          Third-party websites and services operate under their own privacy
          terms. We encourage you to review those terms when using their
          services. Our privacy policy does not replace the privacy policy of an
          external provider.
        </p>

        <p>
          Some providers may process information outside Nigeria. Where this
          occurs, any applicable cross-border data-transfer requirements should
          be addressed before the relevant service is used.
        </p>
      </PolicySection>

      <PolicySection
        id="policy-changes"
        number={8}
        title="Changes to this policy"
      >
        <p>
          We may update this policy when our services, website features,
          business processes, or legal obligations change.
        </p>

        <p>
          When we publish an update, we will revise the “Last updated” date at
          the top of this page. If a change requires additional notice or
          consent under applicable law, we will provide it as required.
        </p>

        <p>
          We encourage you to review this page periodically so you understand
          how personal information is handled.
        </p>
      </PolicySection>

      <PolicySection id="contact-us" number={9} title="Contact us">
        <p>
          If you have questions about this policy, want to exercise a privacy
          right, or have a concern about how your information is handled, please
          contact the Ogim Store support team.
        </p>

        <div className="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-4 sm:p-5">
          <p>
            <strong className="text-[var(--color-ink)]">Email:</strong>{" "}
            <a
              href="mailto:support@ogimstore.com"
              className="break-all font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              support@ogimstore.com
            </a>
          </p>

          <p className="mt-2">
            <strong className="text-[var(--color-ink)]">Contact form:</strong>{" "}
            <Link
              to="/contact"
              className="font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
            >
              Contact Ogim Store support
            </Link>
          </p>
        </div>

        <p>
          Please do not include passwords, card PINs, or one-time passwords in
          your privacy request.
        </p>
      </PolicySection>
    </article>
  );
}
