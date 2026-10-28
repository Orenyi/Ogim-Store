import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type TermsSectionProps = {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
};

function TermsSection({ id, number, title, children }: TermsSectionProps) {
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

export default function TermsContent() {
  return (
    <article className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
      <TermsSection
        id="acceptance-of-terms"
        number={1}
        title="Acceptance of terms"
      >
        <p>
          Welcome to Ogim Store. These Terms of Service govern your access to
          and use of our website, products, and related services. By browsing
          our website, creating an account, or placing an order, you agree to
          these terms.
        </p>

        <p>
          If you do not agree with these terms, please do not use the website or
          place an order through it.
        </p>

        <p>
          These terms should be read alongside our applicable policies,
          including our{" "}
          <Link
            to="/privacy-policy"
            className="font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            to="/returns"
            className="font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            Returns &amp; Refunds Policy
          </Link>
          .
        </p>

        <p>
          You must be legally capable of entering into a binding agreement to
          place orders independently. If you are under the age of 18, you may
          use the service only with the involvement and permission of a parent
          or legal guardian, where permitted by law.
        </p>
      </TermsSection>

      <TermsSection id="use-of-services" number={2} title="Use of our services">
        <p>
          You agree to use Ogim Store only for lawful purposes and in a way that
          does not interfere with the website, other customers, or our
          operations.
        </p>

        <p>When using our services, you agree to:</p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>
            Provide accurate, current, and complete information when required.
          </li>
          <li>Keep your account credentials confidential and secure.</li>
          <li>Use only payment methods you are authorised to use.</li>
          <li>
            Not attempt to disrupt, damage, exploit, or gain unauthorised access
            to our systems.
          </li>
          <li>
            Not submit fraudulent orders, misleading information, or unlawful
            content.
          </li>
          <li>
            Not use our website for scams, fraud, or other illegal activity.
          </li>
        </ul>

        <p>
          You are responsible for activity carried out through your account,
          except where applicable law provides otherwise. Contact us promptly if
          you believe your account has been accessed without your permission.
        </p>

        <p>
          We may investigate suspected misuse and restrict or suspend access
          where reasonably necessary, subject to applicable law and any consumer
          rights you may have.
        </p>
      </TermsSection>

      <TermsSection
        id="products-and-pricing"
        number={3}
        title="Products and pricing"
      >
        <p>
          Ogim Store offers smartphones and related products. Listings may
          identify devices as brand-new, UK-used, or refurbished. Please read
          each product description carefully before purchasing.
        </p>

        <p>Product listings may include:</p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Model, storage capacity, colour, and other specifications.</li>
          <li>
            Condition and any disclosed cosmetic or functional limitations.
          </li>
          <li>
            Price, availability, included accessories, and applicable warranty
            information.
          </li>
          <li>Product photographs and other illustrative material.</li>
        </ul>

        <p>
          We aim to keep product descriptions, images, stock information, and
          prices accurate. However, minor presentation differences may occur,
          and errors can occasionally happen. Photographs should not override
          the specific condition and specification stated in the product
          listing.
        </p>

        <p>
          Prices are displayed in Nigerian naira unless otherwise stated.
          Delivery fees and other applicable charges will be shown during the
          ordering process before you confirm your purchase.
        </p>

        <p>
          If a listing contains a material pricing, specification, or
          availability error, we may need to contact you before fulfilling the
          order. We will explain the issue and any available options, including
          cancellation and a refund where appropriate. We will not treat an
          incorrect listing as permission to charge you an undisclosed amount.
        </p>

        <p>
          Product availability is not guaranteed until your order has been
          accepted and confirmed.
        </p>
      </TermsSection>

      <TermsSection
        id="orders-and-payment"
        number={4}
        title="Orders and payment"
      >
        <p>
          When you place an order, you are submitting a request to purchase the
          selected products. An order acknowledgement confirms that we have
          received your request; it does not necessarily mean the order has been
          accepted for fulfilment.
        </p>

        <p>
          Order acceptance, processing, and dispatch depend on factors such as
          product availability, payment confirmation, accurate order details,
          and fraud-prevention checks.
        </p>

        <p>By placing an order, you agree to:</p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Provide a valid delivery address and contact details.</li>
          <li>
            Review your items, quantities, delivery method, and total before
            confirming.
          </li>
          <li>
            Pay the displayed product prices and applicable delivery charges.
          </li>
          <li>
            Cooperate with reasonable verification needed to process your order.
          </li>
        </ul>

        <p>
          Payments may be processed by third-party payment providers. Payment is
          considered confirmed according to the payment provider's verification
          and our order records. A screenshot or receipt alone may not establish
          that funds have been received.
        </p>

        <p>
          Do not share your card PIN, banking password, or one-time password
          with anyone claiming to represent Ogim Store.
        </p>

        <p>
          If an order is cancelled or a payment needs to be reversed, the
          applicable refund will be handled through the relevant payment process
          and subject to applicable law and the circumstances of the
          transaction.
        </p>
      </TermsSection>

      <TermsSection id="delivery" number={5} title="Delivery">
        <p>
          We aim to deliver orders within the estimated timeframe displayed for
          the selected delivery method and destination. Delivery estimates are
          not guarantees unless expressly stated otherwise.
        </p>

        <p>
          Delivery availability, fees, and estimated times may vary by location,
          stock availability, courier capacity, weather, public holidays, and
          other circumstances outside our reasonable control.
        </p>

        <p>You are responsible for:</p>

        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--color-accent)]">
          <li>Providing a complete and accurate delivery address.</li>
          <li>
            Ensuring someone authorised can receive the package where required.
          </li>
          <li>
            Responding to reasonable delivery enquiries from our team or
            courier.
          </li>
          <li>
            Checking the delivered package and reporting any issue promptly.
          </li>
        </ul>

        <p>
          If a delivery fails because the address is incorrect, the recipient is
          unavailable, or delivery instructions cannot be followed, we may need
          to arrange another attempt and explain any applicable additional
          charges before proceeding.
        </p>

        <p>
          If your order is delayed, lost, or marked delivered but has not been
          received, please contact support with your order number so we can
          investigate.
        </p>

        <p>
          Nothing in these terms removes any delivery, cancellation, refund, or
          other rights available to you under applicable law.
        </p>
      </TermsSection>

      <TermsSection
        id="returns-and-refunds"
        number={6}
        title="Returns and refunds"
      >
        <p>
          We want customers to receive the products they ordered in the
          condition described. If a product is faulty, incorrect, damaged on
          arrival, or otherwise gives rise to a return request, contact our
          support team as soon as possible.
        </p>

        <p>
          Please review our{" "}
          <Link
            to="/returns"
            className="font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-accent-hover)]"
          >
            Returns &amp; Refunds Policy
          </Link>{" "}
          for the return procedure, eligibility conditions, and available
          resolutions.
        </p>

        <p>
          When contacting us, provide your order number, a description of the
          issue, and any reasonable supporting information requested to assess
          the claim.
        </p>

        <p>
          Where a return is approved, we will explain how the item should be
          returned and whether a refund, replacement, repair, or another
          resolution is applicable.
        </p>

        <p>
          Refund timing may depend on the payment method and the processing time
          of the relevant payment provider or financial institution. We will
          communicate the applicable process when the refund is approved.
        </p>

        <p>
          Our published policy does not limit any mandatory consumer rights that
          apply under Nigerian law.
        </p>
      </TermsSection>

      <TermsSection
        id="intellectual-property"
        number={7}
        title="Intellectual property"
      >
        <p>
          Unless otherwise stated, the content on Ogim Store—including text,
          graphics, logos, layouts, product descriptions, and website design—is
          owned by or licensed to Ogim Store and may be protected by
          intellectual property laws.
        </p>

        <p>
          You may browse the website and use its content for personal,
          non-commercial shopping purposes. You must not reproduce, republish,
          distribute, modify, commercially exploit, or create derivative works
          from protected website content without permission, except where
          permitted by law.
        </p>

        <p>
          Product names, logos, and trademarks belonging to manufacturers or
          other third parties remain the property of their respective owners.
          Their appearance on our website does not mean those owners endorse
          Ogim Store unless expressly stated.
        </p>
      </TermsSection>

      <TermsSection
        id="limitation-of-liability"
        number={8}
        title="Limitation of liability"
      >
        <p>
          We make reasonable efforts to keep our website, product information,
          and services reliable and up to date. However, we cannot guarantee
          uninterrupted access or that the website will always be free from
          errors or technical interruptions.
        </p>

        <p>
          To the extent permitted by applicable law, Ogim Store is not
          responsible for losses arising solely from events beyond our
          reasonable control, including certain network outages, third-party
          service interruptions, or unforeseen delivery disruptions.
        </p>

        <p>
          Nothing in these terms excludes or limits liability where doing so
          would be unlawful. This includes any non-excludable consumer rights or
          liability that must remain enforceable under applicable law.
        </p>

        <p>
          Where the law permits a limitation, any assessment of liability will
          take account of the circumstances, the loss involved, and the
          obligations that apply to the relevant transaction.
        </p>
      </TermsSection>

      <TermsSection
        id="changes-to-terms"
        number={9}
        title="Changes to these terms"
      >
        <p>
          We may update these terms when our products, services, website
          features, or legal obligations change. The revised version will be
          published on this page with an updated date.
        </p>

        <p>
          Changes will apply from the date stated in the published version,
          subject to applicable law. Where a change requires specific notice or
          consent, we will take the required steps.
        </p>

        <p>
          Changes will not remove rights that have already accrued or override
          mandatory legal protections. If a change materially affects an
          existing order, we will handle the matter in accordance with the
          agreement applicable to that order and the law.
        </p>
      </TermsSection>

      <TermsSection id="terms-contact" number={10} title="Contact us">
        <p>
          If you have questions about these terms, an order, a payment, or any
          of our store policies, please contact our support team.
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
      </TermsSection>
    </article>
  );
}
