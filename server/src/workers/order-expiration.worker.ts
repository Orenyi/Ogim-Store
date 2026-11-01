import { expirePendingOrders } from "../services/order.service.js";

const EXPIRATION_CHECK_INTERVAL = 60 * 1000;

let isRunning = false;

export function startOrderExpirationWorker(): void {
  console.log("Order expiration worker started.");

  const processExpiredOrders = async (): Promise<void> => {
    // Prevent overlapping expiration checks.
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const expiredCount = await expirePendingOrders();

      if (expiredCount > 0) {
        console.log(
          `Order expiration worker: ${expiredCount} expired order(s) processed.`,
        );
      }
    } catch (error: unknown) {
      console.error("Order expiration worker failed:", error);
    } finally {
      isRunning = false;
    }
  };

  // Process existing expired orders immediately after startup.
  void processExpiredOrders();

  // Continue checking every 60 seconds.
  setInterval(() => {
    void processExpiredOrders();
  }, EXPIRATION_CHECK_INTERVAL);
}
