import { apiRequest } from "../../lib/api";

import type {
  AssignDispatchInput,
  DispatchOrder,
  DispatchQuery,
  DispatchResponse,
  DispatchStatus,
  EligibleDispatchOrder,
} from "../types/dispatch.types";

// ============================================
// API RESPONSE TYPES
// ============================================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface DispatchRecordResponse {
  dispatch: DispatchOrder;
}

interface EligibleOrdersResponse {
  orders: EligibleDispatchOrder[];
}

// ============================================
// GET DISPATCH RECORDS
// ============================================

export async function getAdminDispatches(
  query: DispatchQuery,
): Promise<DispatchResponse> {
  const params = new URLSearchParams({
    search: query.search,
    status: query.status,
    partner: query.partner,
    startDate: query.startDate,
    endDate: query.endDate,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await apiRequest<ApiResponse<DispatchResponse>>(
    `/admin/dispatch?${params.toString()}`,
  );

  return response.data;
}

// ============================================
// GET ELIGIBLE ORDERS FOR DISPATCH
// ============================================

export async function getEligibleDispatchOrders(
  search = "",
): Promise<EligibleDispatchOrder[]> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const queryString = params.toString();

  const response = await apiRequest<ApiResponse<EligibleOrdersResponse>>(
    `/admin/dispatch/eligible-orders${queryString ? `?${queryString}` : ""}`,
  );

  return response.data.orders;
}

// ============================================
// ASSIGN DISPATCH
// ============================================

export async function assignAdminDispatch(
  input: AssignDispatchInput,
): Promise<DispatchOrder> {
  const response = await apiRequest<ApiResponse<DispatchRecordResponse>>(
    "/admin/dispatch/assign",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data.dispatch;
}

// ============================================
// UPDATE DISPATCH STATUS
// ============================================

export async function updateAdminDispatchStatus(
  dispatchId: string,
  status: DispatchStatus,
  note = "",
): Promise<DispatchOrder> {
  const response = await apiRequest<ApiResponse<DispatchRecordResponse>>(
    `/admin/dispatch/${dispatchId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        note,
      }),
    },
  );

  return response.data.dispatch;
}
