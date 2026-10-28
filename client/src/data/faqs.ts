export type FAQCategory =
  | "All"
  | "Products"
  | "Orders"
  | "Delivery"
  | "Returns"
  | "Payments"
  | "Warranty";

export interface FAQ {
  id: string;
  category: Exclude<FAQCategory, "All">;
  question: string;
  answer: string;
}

export const faqCategories: FAQCategory[] = [
  "All",
  "Orders",
  "Delivery",
  "Returns",
  "Payments",
  "Products",
  "Warranty",
];

export const faqs: FAQ[] = [
  {
    id: "genuine-phones",
    category: "Products",
    question: "Are your phones genuine?",
    answer:
      "Ogim Store aims to provide genuine devices with clear product descriptions. Review each listing for its condition, specifications, and included accessories. If you need additional verification before ordering, contact our support team.",
  },
  {
    id: "new-or-used",
    category: "Products",
    question: "Do you sell new or used phones?",
    answer:
      "We offer brand-new, UK-used, and refurbished smartphones where available. Check the condition label on each product page carefully before purchasing, as condition and included accessories may differ.",
  },
  {
    id: "delivery-time",
    category: "Delivery",
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location, product availability, and the delivery option available for your order. Check the estimated delivery information at checkout or contact support to confirm the expected timeframe.",
  },
  {
    id: "return-phone",
    category: "Returns",
    question: "Can I return a phone?",
    answer:
      "Return eligibility depends on the applicable Ogim Store return policy and the circumstances of your order. Contact support with your order number and a description of the issue before sending an item back. Please confirm the current return window and conditions with our team.",
  },
  {
    id: "payment-methods",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "Available payment methods will be displayed during checkout. Use the payment options presented on the official Ogim Store checkout page, and never share your card PIN or one-time password with anyone claiming to be support.",
  },
  {
    id: "warranty",
    category: "Warranty",
    question: "Do you offer a warranty?",
    answer:
      "Warranty coverage can depend on the device and its condition. Check the product listing and any warranty information provided before ordering. If the coverage is unclear, ask our support team to confirm the applicable terms for that device.",
  },
  {
    id: "track-order",
    category: "Orders",
    question: "How can I track my order?",
    answer:
      "Sign in to your Ogim Store account and open My Orders to review your order status and any tracking information available. If tracking details are not displayed or your status has not changed, contact support with your order number.",
  },
  {
    id: "phone-issue",
    category: "Warranty",
    question: "What if my phone has an issue?",
    answer:
      "Contact our support team and describe the issue, including your order number, device model, and when the problem started. Keep your proof of purchase and follow the support team's instructions before arranging a repair or return.",
  },
  {
    id: "outside-abuja",
    category: "Delivery",
    question: "Do you deliver outside Abuja?",
    answer:
      "Ogim Store intends to serve customers beyond Abuja where delivery is available. Enter your delivery location at checkout or contact support to confirm service availability, delivery fees, and estimated delivery time for your area.",
  },
  {
    id: "cancel-order",
    category: "Orders",
    question: "Can I cancel my order after placing it?",
    answer:
      "Cancellation may depend on your order's current status. Contact support as soon as possible with your order number. We cannot guarantee cancellation once an order has been processed or dispatched.",
  },
  {
    id: "order-confirmation",
    category: "Orders",
    question: "How do I know if my order was successful?",
    answer:
      "Check the order confirmation shown after checkout and review My Orders in your account. If you were charged but cannot find an order confirmation, contact support with your order reference and payment details. Never send your PIN or one-time password.",
  },
  {
    id: "delivery-fee",
    category: "Delivery",
    question: "How much does delivery cost?",
    answer:
      "Delivery charges depend on your location and the options available for your order. Review the delivery fee shown at checkout before completing your purchase.",
  },
  {
    id: "inspect-phone",
    category: "Products",
    question: "How do I know the condition of a UK-used or refurbished phone?",
    answer:
      "Review the condition label and product description before buying. If battery health, cosmetic marks, accessories, or other condition details are not specified, contact support to confirm them before placing your order.",
  },
  {
    id: "payment-failed",
    category: "Payments",
    question: "What should I do if my payment fails?",
    answer:
      "Check your payment status and bank notification before trying again. If money was deducted but your order was not confirmed, avoid making repeated payments and contact support with your order reference and transaction details. Never share your PIN or one-time password.",
  },
  {
    id: "change-address",
    category: "Delivery",
    question: "Can I change my delivery address?",
    answer:
      "Contact support as soon as possible if you need to change your address. Changes may not be possible after an order has been dispatched, and any change must be confirmed by the support team.",
  },
  {
    id: "refund-time",
    category: "Returns",
    question: "How long does a refund take?",
    answer:
      "Refund eligibility and processing time depend on the circumstances of the order and the payment provider. Contact support for confirmation of your refund status and the expected processing timeframe.",
  },
];
