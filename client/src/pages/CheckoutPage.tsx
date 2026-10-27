import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CheckoutLayout from "../components/checkout/CheckoutLayout";
import ContactDeliveryForm from "../components/checkout/ContactDeliveryForm";
import DeliveryMethodForm from "../components/checkout/DeliveryMethodForm";
import PaymentMethodForm from "../components/checkout/PaymentMethodForm";
import OrderReview from "../components/checkout/OrderReview";

import { useCheckout, type CheckoutStep } from "../context/CheckoutContext";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { currentStep, setCurrentStep, resetCheckout } = useCheckout();

  const [demoNotice, setDemoNotice] = useState("");

  function goToStep(step: CheckoutStep) {
    setDemoNotice("");
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReviewComplete() {
    // Frontend-only: no order is created and no payment is taken.
    setDemoNotice(
      "Your checkout details are ready. Order placement will be available after the backend and Paystack integration are implemented.",
    );
  }

  function handleBackToCart() {
    navigate("/cart");
  }

  function handleContinueShopping() {
    resetCheckout();
    navigate("/shop");
  }

  return (
    <CheckoutLayout
      currentStep={currentStep}
      showOrderSummary={currentStep !== 4}
      showEditCartLink
    >
      {currentStep === 1 && (
        <ContactDeliveryForm
          onContinue={() => goToStep(2)}
          onBack={handleBackToCart}
        />
      )}

      {currentStep === 2 && (
        <DeliveryMethodForm
          onContinue={() => goToStep(3)}
          onBack={() => goToStep(1)}
        />
      )}

      {currentStep === 3 && (
        <PaymentMethodForm
          onContinue={() => goToStep(4)}
          onBack={() => goToStep(2)}
        />
      )}

      {currentStep === 4 && (
        <>
          <OrderReview
            onPlaceOrder={handleReviewComplete}
            onEditContact={() => goToStep(1)}
            onEditDelivery={() => goToStep(2)}
            onBack={() => goToStep(3)}
          />

          {demoNotice && (
            <div
              role="status"
              className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
            >
              <p className="text-sm leading-6 text-[var(--color-ink)]">
                {demoNotice}
              </p>

              <button
                type="button"
                onClick={handleContinueShopping}
                className="mt-3 text-sm font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                Continue shopping
              </button>
            </div>
          )}
        </>
      )}
    </CheckoutLayout>
  );
}
