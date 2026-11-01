import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CheckoutLayout from "../components/checkout/CheckoutLayout";
import ContactDeliveryForm from "../components/checkout/ContactDeliveryForm";
import DeliveryMethodForm from "../components/checkout/DeliveryMethodForm";
import PaymentMethodForm from "../components/checkout/PaymentMethodForm";
import OrderReview from "../components/checkout/OrderReview";

import { useCheckout, type CheckoutStep } from "../context/CheckoutContext";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../lib/api";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { currentStep, setCurrentStep, contactDetails, deliveryMethod } =
    useCheckout();

  const { items, isHydrated, refreshCart } = useCart();

  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent duplicate order requests from repeated clicks.
  const submissionInProgress = useRef(false);

  function goToStep(step: CheckoutStep) {
    setOrderError("");
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePlaceOrder() {
    if (submissionInProgress.current) return;

    setOrderError("");

    if (!isHydrated) {
      setOrderError("Your cart is still loading. Please try again.");
      return;
    }

    const selectedItems = items.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setOrderError(
        "Please select at least one item before placing your order.",
      );
      return;
    }

    if (
      !contactDetails.fullName ||
      !contactDetails.email ||
      !contactDetails.phone ||
      !contactDetails.state ||
      !contactDetails.city ||
      !contactDetails.address
    ) {
      setOrderError(
        "Please complete your delivery information before placing your order.",
      );
      return;
    }

    if (!deliveryMethod) {
      setOrderError("Please select a delivery method.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const response = await createOrder({
        items: selectedItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),

        deliveryAddress: {
          fullName: contactDetails.fullName.trim(),
          email: contactDetails.email.trim(),
          phone: contactDetails.phone.trim(),
          state: contactDetails.state.trim(),
          city: contactDetails.city.trim(),
          address: contactDetails.address.trim(),
          instructions: contactDetails.instructions?.trim() ?? "",
        },

        deliveryMethod,
      });

      const order = response.data.order;
      const reservationExpiresAt = response.data.reservationExpiresAt;

      // The backend has already created the order and updated the cart.
      // Refresh the frontend cart to reflect the remaining quantities.
      try {
        await refreshCart();
      } catch (refreshError) {
        console.error("Order created, but cart refresh failed:", refreshError);
      }

      // Pass the actual backend order to the confirmation page.
      navigate("/checkout/confirmation", {
        replace: true,
        state: {
          order,
          reservationExpiresAt,
        },
      });
    } catch (error) {
      console.error("Order creation failed:", error);

      setOrderError(
        error instanceof Error
          ? error.message
          : "We couldn't create your order. Please try again.",
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
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
          onBack={() => navigate("/cart")}
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
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
            onEditContact={() => goToStep(1)}
            onEditDelivery={() => goToStep(2)}
            onBack={() => goToStep(3)}
          />

          {orderError && (
            <div
              role="alert"
              className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4"
            >
              <p className="text-sm leading-6 text-[var(--color-error)]">
                {orderError}
              </p>
            </div>
          )}

          {isSubmitting && (
            <div
              role="status"
              className="mt-4 flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
            >
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-stone)] border-t-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-muted)]">
                Creating your order and reserving your items...
              </p>
            </div>
          )}
        </>
      )}
    </CheckoutLayout>
  );
}
