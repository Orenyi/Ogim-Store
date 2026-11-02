import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

import { useCheckout } from "../context/CheckoutContext";

import {
  verifyOrderPayment,
  type OrderApiRecord,
  type PaymentAttemptStatus,
} from "../lib/api";

const PENDING_ORDER_STORAGE_KEY = "ogim_pending_payment_order_id";

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const conditionLabels: Record<string, string> = {
  "brand-new": "Brand new",
  new: "Brand new",
  "uk-used": "UK used",
  refurbished: "Refurbished",
};

const deliveryLabels: Record<string, string> = {
  standard: "Standard delivery",
  express: "Express delivery",
  "same-day": "Same-day delivery",
};

interface OrderConfirmationState {
  order: OrderApiRecord;
  reservationExpiresAt: string;
}

interface PaymentResult {
  verified: boolean;
  paymentStatus: PaymentAttemptStatus;
  message: string;
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getOrderStatusLabel(status: OrderApiRecord["status"]) {
  const labels: Record<OrderApiRecord["status"], string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    expired: "Expired",
    fulfilled: "Fulfilled",
  };

  return labels[status] ?? status;
}

function getPaymentStatusLabel(status: OrderApiRecord["paymentStatus"]) {
  const labels: Record<OrderApiRecord["paymentStatus"], string> = {
    pending: "Awaiting payment",
    paid: "Paid",
    failed: "Payment failed",
    refunded: "Refunded",
  };

  return labels[status] ?? status;
}

function getPaymentAttemptLabel(status?: PaymentAttemptStatus) {
  if (!status) return null;

  const labels: Record<PaymentAttemptStatus, string> = {
    initializing: "Initializing payment",
    pending: "Payment processing",
    success: "Payment successful",
    failed: "Payment failed",
    abandoned: "Payment abandoned",
    expired: "Payment attempt expired",
    refunded: "Payment refunded",
  };

  return labels[status] ?? status;
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { resetCheckout } = useCheckout();

  const confirmationState = location.state as OrderConfirmationState | null;

  const [order, setOrder] = useState<OrderApiRecord | null>(
    confirmationState?.order ?? null,
  );

  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null,
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const searchParams = new URLSearchParams(location.search);

  const orderId = searchParams.get("orderId");

  // Paystack normally returns both reference and trxref.
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const reservationExpiresAt =
    order?.reservationExpiresAt ?? confirmationState?.reservationExpiresAt;

  const handleRetryVerification = useCallback(() => {
    setVerificationError("");
    setRetryCount((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!orderId || !reference) {
      return;
    }

    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const verifyPayment = async (attempt = 1) => {
      if (!isActive) return;

      setIsVerifying(true);
      setVerificationError("");

      let shouldRetry = false;

      try {
        const response = await verifyOrderPayment(orderId, reference);

        if (!isActive) return;

        const verificationData = response.data;

        setOrder(verificationData.order);

        setPaymentResult({
          verified: verificationData.verified,
          paymentStatus: verificationData.paymentStatus,
          message: verificationData.message,
        });

        // Clear checkout state and saved order ID only after
        // the backend has successfully verified the payment.
        if (
          verificationData.verified &&
          verificationData.paymentStatus === "success"
        ) {
          resetCheckout();

          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);

          return;
        }

        // Retry a limited number of times while Paystack
        // reports that payment is still processing.
        shouldRetry =
          (verificationData.paymentStatus === "initializing" ||
            verificationData.paymentStatus === "pending") &&
          attempt < 3;
      } catch (error) {
        if (!isActive) return;

        const message =
          error instanceof Error
            ? error.message
            : "We couldn't verify your payment right now.";

        setVerificationError(message);

        // Retry temporary verification failures, but never indefinitely.
        shouldRetry = attempt < 3;
      } finally {
        if (isActive) {
          setIsVerifying(false);
        }
      }

      if (shouldRetry && isActive) {
        retryTimer = setTimeout(() => {
          void verifyPayment(attempt + 1);
        }, 4000);
      }
    };

    void verifyPayment();

    return () => {
      isActive = false;

      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [orderId, reference, retryCount, resetCheckout]);

  function handleContinueShopping() {
    if (order?.paymentStatus === "paid" && paymentResult?.verified) {
      resetCheckout();
      sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    }

    navigate("/shop", { replace: true });
  }

  const isPaymentSuccessful =
    order?.paymentStatus === "paid" && paymentResult?.verified === true;

  const isReconciliationRequired =
    paymentResult?.paymentStatus === "success" &&
    paymentResult.verified === false;

  const isPaymentFailed =
    paymentResult?.paymentStatus === "failed" ||
    paymentResult?.paymentStatus === "abandoned" ||
    paymentResult?.paymentStatus === "expired" ||
    order?.paymentStatus === "failed";

  const paymentStatusLabel = isVerifying
    ? "Verifying payment..."
    : isReconciliationRequired
      ? "Payment received — confirmation pending"
      : isPaymentSuccessful
        ? "Paid"
        : paymentResult
          ? getPaymentAttemptLabel(paymentResult.paymentStatus)
          : order
            ? getPaymentStatusLabel(order.paymentStatus)
            : "Awaiting payment";

  // Loading state when returning from Paystack without navigation state.
  if (!order && isVerifying) {
    return (
      <main className="min-h-screen bg-[var(--color-paper)] py-12">
        <div className="page-container">
          <section className="mx-auto max-w-xl rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-card)]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-ink)]">
              <FiRefreshCw
                size={26}
                className="animate-spin"
                aria-hidden="true"
              />
            </span>

            <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)]">
              Verifying your payment
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              Please wait while we securely confirm your payment with Paystack.
              Do not close this page.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[var(--color-paper)] py-12">
        <div className="page-container">
          <section className="mx-auto max-w-xl rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-ink)]">
              <FiPackage size={28} aria-hidden="true" />
            </span>

            <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)]">
              Order details unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              {verificationError ||
                "We couldn't find the order details for this page. If you recently placed an order, check your account for your order information."}
            </p>

            {orderId && reference && (
              <button
                type="button"
                onClick={handleRetryVerification}
                disabled={isVerifying}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw size={16} aria-hidden="true" />
                Try verification again
              </button>
            )}

            <div className="mt-7 flex flex-col gap-3">
              <Link
                to="/account/orders"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
              >
                View my orders
                <FiArrowRight className="ml-2" size={17} aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={handleContinueShopping}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
              >
                Continue shopping
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const deliveryAddress = order.deliveryAddress;
  const orderItems = order.items ?? [];

  return (
    <main className="min-h-screen bg-[var(--color-paper)] py-8 sm:py-12">
      <div className="page-container">
        <div className="mx-auto max-w-2xl">
          <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--color-border)] px-5 py-8 text-center sm:px-8 sm:py-10">
              <span
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  isPaymentSuccessful
                    ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                    : isPaymentFailed
                      ? "bg-[var(--color-error-soft)] text-[var(--color-error)]"
                      : "bg-[var(--color-warning-soft)] text-[var(--color-ink)]"
                }`}
              >
                {isPaymentSuccessful ? (
                  <FiCheckCircle size={34} aria-hidden="true" />
                ) : isPaymentFailed ? (
                  <FiAlertCircle size={34} aria-hidden="true" />
                ) : isVerifying ? (
                  <FiRefreshCw
                    size={30}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <FiClock size={32} aria-hidden="true" />
                )}
              </span>

              <span
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  isPaymentSuccessful
                    ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                    : isPaymentFailed
                      ? "bg-[var(--color-error-soft)] text-[var(--color-error)]"
                      : "bg-[var(--color-warning-soft)] text-[var(--color-ink)]"
                }`}
              >
                {isPaymentSuccessful
                  ? "PAYMENT CONFIRMED"
                  : isReconciliationRequired
                    ? "PAYMENT RECEIVED — REVIEW REQUIRED"
                    : isPaymentFailed
                      ? "PAYMENT NOT COMPLETED"
                      : isVerifying
                        ? "VERIFYING PAYMENT"
                        : "ORDER CREATED — PAYMENT PENDING"}
              </span>

              <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl">
                {isPaymentSuccessful
                  ? "Your payment was successful!"
                  : isReconciliationRequired
                    ? "We're confirming your order"
                    : isPaymentFailed
                      ? "Your payment was not completed"
                      : isVerifying
                        ? "Verifying your payment"
                        : "Your order has been created!"}
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                {isPaymentSuccessful
                  ? "Your payment has been verified successfully. Your order is now confirmed."
                  : isReconciliationRequired
                    ? "Paystack reports a successful payment, but your order could not be automatically confirmed. Our system needs to reconcile this transaction."
                    : isPaymentFailed
                      ? "We couldn't confirm a successful payment for this order. Check your account for the latest order information."
                      : isVerifying
                        ? "Please wait while we securely verify your transaction with Paystack."
                        : "Your order has been recorded. Your selected items are temporarily reserved while awaiting payment."}
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
              <section className="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Order reference
                </p>

                <p className="mt-1 break-all text-lg font-extrabold text-[var(--color-ink)]">
                  {order.orderNumber}
                </p>

                {order.createdAt && (
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                )}
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-3">
                  <p className="text-xs text-[var(--color-muted)]">
                    Order status
                  </p>
                  <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
                    {getOrderStatusLabel(order.status)}
                  </p>
                </div>

                <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-3">
                  <p className="text-xs text-[var(--color-muted)]">
                    Payment status
                  </p>
                  <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
                    {paymentStatusLabel}
                  </p>
                </div>
              </section>

              {(isVerifying ||
                verificationError ||
                paymentResult?.message ||
                isReconciliationRequired) && (
                <section
                  className={`rounded-[var(--radius-control)] border p-4 ${
                    isPaymentSuccessful
                      ? "border-[var(--color-success)] bg-[var(--color-success-soft)]"
                      : isPaymentFailed || verificationError
                        ? "border-[var(--color-error)] bg-[var(--color-error-soft)]"
                        : "border-[var(--color-warning)] bg-[var(--color-warning-soft)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isPaymentSuccessful ? (
                      <FiCheckCircle
                        className="mt-0.5 shrink-0 text-[var(--color-success)]"
                        size={19}
                        aria-hidden="true"
                      />
                    ) : isPaymentFailed || verificationError ? (
                      <FiAlertCircle
                        className="mt-0.5 shrink-0 text-[var(--color-error)]"
                        size={19}
                        aria-hidden="true"
                      />
                    ) : (
                      <FiClock
                        className="mt-0.5 shrink-0 text-[var(--color-ink)]"
                        size={19}
                        aria-hidden="true"
                      />
                    )}

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-ink)]">
                        {isPaymentSuccessful
                          ? "Payment verified"
                          : isReconciliationRequired
                            ? "Payment reconciliation required"
                            : isPaymentFailed
                              ? "Payment unsuccessful"
                              : isVerifying
                                ? "Checking payment status"
                                : "Payment verification"}
                      </p>

                      <p className="mt-1 break-words text-sm leading-6 text-[var(--color-muted)]">
                        {verificationError ||
                          paymentResult?.message ||
                          "We are checking your transaction status."}
                      </p>

                      {verificationError && (
                        <button
                          type="button"
                          onClick={handleRetryVerification}
                          disabled={isVerifying}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-ink)] underline underline-offset-4 disabled:opacity-60"
                        >
                          <FiRefreshCw size={15} aria-hidden="true" />
                          Retry verification
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {reservationExpiresAt &&
                order.status === "pending" &&
                order.paymentStatus === "pending" && (
                  <section className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-warning)] bg-[var(--color-warning-soft)] p-4">
                    <FiClock
                      className="mt-0.5 shrink-0 text-[var(--color-ink)]"
                      size={19}
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-sm font-bold text-[var(--color-ink)]">
                        Temporary stock reservation
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                        Your reserved items are held until:
                      </p>

                      <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
                        {formatDate(reservationExpiresAt)}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                        If payment is not completed before the reservation
                        expires, the order may be automatically cancelled and
                        the reserved stock released.
                      </p>
                    </div>
                  </section>
                )}

              <section>
                <div className="flex items-center gap-2">
                  <FiMapPin
                    className="text-[var(--color-accent)]"
                    size={18}
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-[var(--color-ink)]">
                    Delivery details
                  </h2>
                </div>

                <div className="mt-3 space-y-1 text-sm leading-6">
                  <p className="font-semibold text-[var(--color-ink)]">
                    {deliveryAddress.fullName}
                  </p>
                  <p className="break-words text-[var(--color-muted)]">
                    {deliveryAddress.email}
                  </p>
                  <p className="text-[var(--color-muted)]">
                    {deliveryAddress.phone}
                  </p>
                  <p className="text-[var(--color-muted)]">
                    {deliveryAddress.address}, {deliveryAddress.city},{" "}
                    {deliveryAddress.state}
                  </p>

                  {deliveryAddress.instructions && (
                    <p className="pt-1 text-[var(--color-muted)]">
                      <span className="font-semibold">Instructions:</span>{" "}
                      {deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center gap-2">
                  <FiTruck
                    className="text-[var(--color-accent)]"
                    size={18}
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-[var(--color-ink)]">
                    Delivery method
                  </h2>
                </div>

                <div className="mt-3 flex items-start justify-between gap-4 text-sm">
                  <p className="font-semibold text-[var(--color-ink)]">
                    {deliveryLabels[order.deliveryMethod] ??
                      order.deliveryMethod}
                  </p>
                  <p className="shrink-0 font-bold tabular-nums text-[var(--color-ink)]">
                    {formatNaira(order.deliveryFee)}
                  </p>
                </div>
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center gap-2">
                  <FiPackage
                    className="text-[var(--color-accent)]"
                    size={18}
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-[var(--color-ink)]">
                    Items (
                    {orderItems.reduce(
                      (count, item) => count + item.quantity,
                      0,
                    )}
                    )
                  </h2>
                </div>

                {orderItems.length > 0 ? (
                  <ul className="mt-3 divide-y divide-[var(--color-border)]">
                    {orderItems.map((item, index) => (
                      <li
                        key={`${item.productId}-${index}`}
                        className="flex gap-3 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="h-[76px] w-[68px] shrink-0 overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-surface-muted)]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[var(--color-muted)]">
                              <FiPackage size={24} aria-hidden="true" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[var(--color-ink)]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {item.brand}
                            {item.model ? ` · ${item.model}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {conditionLabels[item.condition] ?? item.condition}
                            {" · "}Qty: {item.quantity}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            Unit price: {formatNaira(item.unitPrice)}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold tabular-nums text-[var(--color-ink)]">
                          {formatNaira(item.lineTotal)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    No order items were returned.
                  </p>
                )}
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <h2 className="font-bold text-[var(--color-ink)]">
                  Payment summary
                </h2>

                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-muted)]">Subtotal</span>
                    <span className="font-semibold tabular-nums text-[var(--color-ink)]">
                      {formatNaira(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-muted)]">Delivery</span>
                    <span className="font-semibold tabular-nums text-[var(--color-ink)]">
                      {formatNaira(order.deliveryFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
                    <span className="font-bold text-[var(--color-ink)]">
                      Order total
                    </span>
                    <span className="text-xl font-extrabold tabular-nums text-[var(--color-ink)]">
                      {formatNaira(order.total)}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-[var(--color-muted)]">
                    This is the total calculated and saved by the Ogim Store
                    server.
                  </p>
                </div>
              </section>

              <section className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  What happens next?
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  {isPaymentSuccessful
                    ? "Your payment has been verified and your order is confirmed. You can follow your order updates from your customer account."
                    : isReconciliationRequired
                      ? "Your payment was reported as successful, but the order needs further reconciliation. Please contact support with your order reference before making another payment."
                      : isPaymentFailed
                        ? "Your payment was not confirmed. Check your account for the latest order status before attempting another payment."
                        : "Your order has been created and your selected stock has been temporarily reserved. Payment must be completed before the reservation expires."}
                </p>
              </section>

              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  <FiShoppingBag size={17} aria-hidden="true" />
                  Continue shopping
                  <FiArrowRight size={17} aria-hidden="true" />
                </button>

                <Link
                  to="/account/orders"
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
                >
                  View my orders
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
