import { apiRequest } from "../../lib/api";

import type {
  TrackingOrder,
  TrackingQuery,
  TrackingResponse,
  TrackingUpdateInput,
} from "../types/tracking.types";

// ============================================
// API RESPONSE TYPES
// ============================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TrackingOrderResponse {
  order: TrackingOrder;
}

// ============================================
// GET TRACKING ORDERS
// ============================================

export async function getAdminTrackingOrders(
  query: TrackingQuery,
): Promise<TrackingResponse> {
  const params = new URLSearchParams({
    search: query.search,
    status: query.status,
    partner: query.partner,
    startDate: query.startDate,
    endDate: query.endDate,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await apiRequest<ApiResponse<TrackingResponse>>(
    `/admin/tracking?${params.toString()}`,
  );

  return response.data;
}

// ============================================
// GET TRACKING ORDER BY ID
// ============================================

export async function getAdminTrackingOrderById(
  orderId: string,
): Promise<TrackingOrder> {
  if (!orderId.trim()) {
    throw new Error("Order ID is required.");
  }

  const response = await apiRequest<ApiResponse<TrackingOrderResponse>>(
    `/admin/tracking/${encodeURIComponent(orderId)}`,
  );

  return response.data.order;
}

// ============================================
// UPDATE TRACKING
// ============================================

export async function updateAdminTracking(
  input: TrackingUpdateInput,
): Promise<TrackingOrder> {
  if (!input.orderId.trim()) {
    throw new Error("Order ID is required.");
  }

  const response = await apiRequest<ApiResponse<TrackingOrderResponse>>(
    `/admin/tracking/${encodeURIComponent(input.orderId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: input.status,
        trackingNumber: input.trackingNumber,
        deliveryPartner: input.deliveryPartner,
        note: input.note,
      }),
    },
  );

  return response.data.order;
}
