import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CheckoutLayout from "../components/checkout/CheckoutLayout";
import ContactDeliveryForm from "../components/checkout/ContactDeliveryForm";
import DeliveryMethodForm from "../components/checkout/DeliveryMethodForm";
import PaymentMethodForm from "../components/checkout/PaymentMethodForm";
import OrderReview from "../components/checkout/OrderReview";

import { useCheckout, type CheckoutStep } from "../context/CheckoutContext";
import { useCart } from "../hooks/useCart";

import { ApiError, createOrder, initializeOrderPayment } from "../lib/api";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { currentStep, setCurrentStep, contactDetails, deliveryMethod } =
    useCheckout();

  const { items, isHydrated, refreshCart } = useCart();

  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep the pending order only in this checkout component.
  // Never reuse a globally shared sessionStorage order ID.
  const [pendingOrderId, setPendingOrderId] = useState("");

  const submissionInProgress = useRef(false);

  function goToStep(step: CheckoutStep) {
    setOrderError("");
    setCurrentStep(step);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function clearPendingOrder() {
    setPendingOrderId("");
  }

  async function handlePlaceOrder() {
    if (submissionInProgress.current) {
      return;
    }

    setOrderError("");

    if (!isHydrated) {
      setOrderError("Your cart is still loading. Please try again.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    let redirectingToPaystack = false;

    try {
      let orderId = pendingOrderId;

      // ============================================
      // 1. CREATE A NEW ORDER WHEN REQUIRED
      // ============================================

      if (!orderId) {
        const selectedItems = items.filter((item) => item.selected);

        if (selectedItems.length === 0) {
          throw new Error(
            "Your cart has no selected items. Please return to the shop, add products to your cart and try again.",
          );
        }

        if (
          !contactDetails.fullName?.trim() ||
          !contactDetails.email?.trim() ||
          !contactDetails.phone?.trim() ||
          !contactDetails.state?.trim() ||
          !contactDetails.city?.trim() ||
          !contactDetails.address?.trim()
        ) {
          throw new Error(
            "Please complete your delivery information before placing your order.",
          );
        }

        if (!deliveryMethod) {
          throw new Error("Please select a delivery method.");
        }

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

        orderId = response.data.order._id;

        if (!orderId) {
          throw new Error(
            "Your order was created, but the server did not return an order ID. Please contact support.",
          );
        }

        // Keep the ID only in this checkout session.
        setPendingOrderId(orderId);

        // The backend removes purchased items from the cart.
        try {
          await refreshCart();
        } catch (refreshError) {
          console.error(
            "Order created, but cart refresh failed:",
            refreshError,
          );
        }
      }

      // ============================================
      // 2. INITIALIZE PAYSTACK PAYMENT
      // ============================================

      let paymentResponse;

      try {
        paymentResponse = await initializeOrderPayment(orderId);
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          // The order may belong to a previous account,
          // have been deleted, or no longer be available.
          if (error.status === 404) {
            clearPendingOrder();

            throw new Error(
              "This checkout order could not be found. Your checkout reference has been cleared. Please click Place order again to create a new order.",
            );
          }

          if (
            error.status === 409 &&
            /no longer available for payment|already been paid/i.test(
              error.message,
            )
          ) {
            const orderAlreadyPaid = /already been paid/i.test(error.message);

            clearPendingOrder();

            if (orderAlreadyPaid) {
              throw new Error(
                "This previous order has already been paid for. Your checkout reference has been cleared. If you want to make another purchase, add your new products to your cart and place a new order.",
              );
            }

            throw new Error(
              "Your previous order has expired and can no longer be paid for. Please return to the shop, add your products to your cart again, and create a new order.",
            );
          }
        }

        throw error;
      }

      // ============================================
      // 3. VALIDATE PAYSTACK CHECKOUT URL
      // ============================================

      const authorizationUrl = paymentResponse.data.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack did not return a checkout URL. Please try again.",
        );
      }

      let checkoutUrl: URL;

      try {
        checkoutUrl = new URL(authorizationUrl);
      } catch {
        throw new Error(
          "Paystack returned an invalid checkout URL. Please contact support.",
        );
      }

      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.paystack.com"
      ) {
        throw new Error(
          "Paystack returned an untrusted checkout URL. Please contact support.",
        );
      }

      // ============================================
      // 4. REDIRECT TO PAYSTACK
      // ============================================

      redirectingToPaystack = true;

      window.location.assign(checkoutUrl.toString());
    } catch (error: unknown) {
      console.error("Checkout payment initialization failed:", error);

      setOrderError(
        error instanceof Error
          ? error.message
          : "We couldn't initialize your payment. Please try again.",
      );
    } finally {
      if (!redirectingToPaystack) {
        submissionInProgress.current = false;
        setIsSubmitting(false);
      }
    }
  }

  const isPreviousOrderPaid = orderError.includes(
    "previous order has already been paid",
  );

  const isPreviousOrderExpired = orderError.includes(
    "previous order has expired",
  );

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

              {isPreviousOrderPaid && (
                <button
                  type="button"
                  onClick={() => navigate("/account/orders")}
                  className="mt-3 text-sm font-bold text-[var(--color-accent)] underline underline-offset-4"
                >
                  View my orders
                </button>
              )}

              {isPreviousOrderExpired && (
                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="mt-3 text-sm font-bold text-[var(--color-accent)] underline underline-offset-4"
                >
                  Return to shop
                </button>
              )}
            </div>
          )}

          {isSubmitting && (
            <div
              role="status"
              className="mt-4 flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
            >
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-stone)] border-t-[var(--color-accent)]" />

              <p className="text-sm text-[var(--color-muted)]">
                {pendingOrderId
                  ? "Connecting to Paystack securely..."
                  : "Creating your order and preparing payment..."}
              </p>
            </div>
          )}
        </>
      )}
    </CheckoutLayout>
  );
}
