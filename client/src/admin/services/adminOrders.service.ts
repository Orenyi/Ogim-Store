import { demoOrders, demoOrdersSummary } from "../data/orders.mock";

import type {
  AdminOrder,
  AdminOrdersQuery,
  AdminOrdersResponse,
} from "../types/orders.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

/**
 * Fetch, search and filter admin orders.
 *
 * Currently uses demo data when VITE_USE_ADMIN_MOCKS=true.
 * Replace the mock implementation with the admin API
 * when backend integration is ready.
 */
export async function getAdminOrders(
  query: AdminOrdersQuery,
): Promise<AdminOrdersResponse> {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin orders API has not been connected yet.");
  }

  // Simulate an asynchronous data request.
  await new Promise((resolve) => setTimeout(resolve, 250));

  let filteredOrders = [...demoOrders];

  // Search by order number, customer details or product.
  if (query.search?.trim()) {
    const search = query.search.trim().toLowerCase();

    filteredOrders = filteredOrders.filter((order) => {
      const searchableValues = [
        order.orderNumber,
        order.customer.fullName,
        order.customer.email,
        order.customer.phoneNumber,
        ...order.items.map((item) => item.productName),
      ];

      return searchableValues.some((value) =>
        value.toLowerCase().includes(search),
      );
    });
  }

  // Filter by fulfilment status.
  if (query.fulfilmentStatus && query.fulfilmentStatus !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.fulfilmentStatus === query.fulfilmentStatus,
    );
  }

  // Filter by payment status.
  if (query.paymentStatus && query.paymentStatus !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.paymentStatus === query.paymentStatus,
    );
  }

  // Filter by start date.
  if (query.startDate) {
    const start = new Date(`${query.startDate}T00:00:00`);

    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.orderedAt) >= start,
    );
  }

  // Filter by end date.
  if (query.endDate) {
    const end = new Date(`${query.endDate}T23:59:59.999`);

    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.orderedAt) <= end,
    );
  }

  // Pagination.
  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const page = Math.min(Math.max(1, query.page), totalPages);

  const startIndex = (page - 1) * query.limit;

  const orders = filteredOrders.slice(startIndex, startIndex + query.limit);

  return {
    orders,
    summary: demoOrdersSummary,
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

/**
 * Fetch a single order by its database ID or order number.
 *
 * This supports both:
 * /admin/orders/demo-order-10421
 * /admin/orders/%23OGM-10421
 */
export async function getAdminOrderById(orderId: string): Promise<AdminOrder> {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin order details API has not been connected yet.");
  }

  if (!orderId.trim()) {
    throw new Error("A valid order ID is required.");
  }

  // Simulate an asynchronous data request.
  await new Promise((resolve) => setTimeout(resolve, 250));

  const normalizedOrderId = orderId.trim();

  const order = demoOrders.find(
    (item) =>
      item.id === normalizedOrderId || item.orderNumber === normalizedOrderId,
  );

  if (!order) {
    throw new Error("The requested order could not be found.");
  }

  return order;
}
