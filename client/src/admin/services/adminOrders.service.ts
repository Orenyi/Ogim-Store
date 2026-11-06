import { apiRequest } from "../../lib/api";

import type {
  AdminOrder,
  AdminOrdersQuery,
  AdminOrdersResponse,
} from "../types/orders.types";

interface AdminOrdersApiResponse {
  success: boolean;
  data: AdminOrdersResponse;
}

interface AdminOrderApiResponse {
  success: boolean;
  data: AdminOrder;
}

function buildOrdersQuery(query: AdminOrdersQuery): string {
  const params = new URLSearchParams();

  params.set("page", String(query.page));
  params.set("limit", String(query.limit));

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.fulfilmentStatus && query.fulfilmentStatus !== "all") {
    params.set("fulfilmentStatus", query.fulfilmentStatus);
  }

  if (query.paymentStatus && query.paymentStatus !== "all") {
    params.set("paymentStatus", query.paymentStatus);
  }

  if (query.startDate) {
    params.set("startDate", query.startDate);
  }

  if (query.endDate) {
    params.set("endDate", query.endDate);
  }

  return params.toString();
}

/**
 * Fetch, search and filter real admin orders.
 *
 * This service always uses the protected admin API.
 * It does not read from mock data or the global admin mock setting.
 */
export async function getAdminOrders(
  query: AdminOrdersQuery,
): Promise<AdminOrdersResponse> {
  const queryString = buildOrdersQuery(query);

  const response = await apiRequest<AdminOrdersApiResponse>(
    `/admin/orders?${queryString}`,
  );

  if (!response.success || !response.data) {
    throw new Error("Unable to retrieve admin orders.");
  }

  return response.data;
}

/**
 * Fetch a single order using its MongoDB database ID.
 *
 * GET /api/v1/admin/orders/:orderId
 */
export async function getAdminOrderById(orderId: string): Promise<AdminOrder> {
  const normalizedOrderId = orderId.trim();

  if (!normalizedOrderId) {
    throw new Error("A valid order ID is required.");
  }

  const response = await apiRequest<AdminOrderApiResponse>(
    `/admin/orders/${encodeURIComponent(normalizedOrderId)}`,
  );

  if (!response.success || !response.data) {
    throw new Error("Unable to retrieve order details.");
  }

  return response.data;
}
