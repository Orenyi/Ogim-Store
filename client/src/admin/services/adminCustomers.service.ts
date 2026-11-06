import { apiRequest } from "../../lib/api";

import type {
  AdminCustomer,
  CustomersQuery,
  CustomersResponse,
} from "../types/customers.types";

interface AdminCustomersApiResponse {
  success: boolean;
  data: CustomersResponse;
}

interface UpdateCustomerStatusApiResponse {
  success: boolean;
  message: string;
  data: AdminCustomer;
}

/**
 * Fetch customers from the admin API.
 *
 * Supports:
 * - Search by name, email or phone number
 * - Account status filtering
 * - Order history filtering
 * - Pagination
 * - Customer statistics
 */
export async function getAdminCustomers(
  query: CustomersQuery,
): Promise<CustomersResponse> {
  const params = new URLSearchParams({
    search: query.search.trim(),
    status: query.status,
    hasOrders: query.hasOrders,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await apiRequest<AdminCustomersApiResponse>(
    `/admin/customers?${params.toString()}`,
  );

  if (!response.success || !response.data) {
    throw new Error("Unable to retrieve customers.");
  }

  return response.data;
}

/**
 * Update a customer's account status.
 *
 * The backend maps:
 * - active -> active
 * - inactive -> disabled
 */
export async function updateAdminCustomerStatus(
  customerId: string,
  status: AdminCustomer["status"],
): Promise<AdminCustomer> {
  const response = await apiRequest<UpdateCustomerStatusApiResponse>(
    `/admin/customers/${encodeURIComponent(customerId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  if (!response.success || !response.data) {
    throw new Error("Unable to update customer status.");
  }

  return response.data;
}
