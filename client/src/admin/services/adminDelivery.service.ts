import { apiRequest } from "../../lib/api";

import type {
  DeliveryFee,
  DeliveryFeeInput,
  DeliveryFeeUpdate,
  DeliveryFeesQuery,
  DeliveryFeesResponse,
  DeliverySettings,
  DeliveryZone,
} from "../types/delivery.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface DeliveryFeeResponse {
  fee: DeliveryFee;
}

interface DeliverySettingsResponse {
  settings: DeliverySettings;
}

interface DeliveryZoneResponse {
  zone: DeliveryZone;
}

export interface DeliveryZoneInput {
  name: string;
  state: string;
  locations: string[];
  estimatedDelivery: string;
  status?: "active" | "inactive";
}

export type DeliveryZoneUpdate = Partial<DeliveryZoneInput>;

export interface DeliveryZonesQuery {
  search: string;
  state: string;
  status: "active" | "inactive" | "all";
  page: number;
  limit: number;
}

export interface DeliveryZonesResponse {
  zones: DeliveryZone[];
  summary: {
    totalZones: number;
    activeZones: number;
    inactiveZones: number;
    totalLocations: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// DELIVERY FEES
// ============================================

export async function getAdminDeliveryFees(
  query: DeliveryFeesQuery,
): Promise<DeliveryFeesResponse> {
  const params = new URLSearchParams({
    search: query.search,
    state: query.state,
    status: query.status,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await apiRequest<ApiResponse<DeliveryFeesResponse>>(
    `/admin/delivery/fees?${params.toString()}`,
  );

  return response.data;
}

export async function createAdminDeliveryFee(
  input: DeliveryFeeInput,
): Promise<DeliveryFee> {
  const response = await apiRequest<ApiResponse<DeliveryFeeResponse>>(
    "/admin/delivery/fees",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data.fee;
}

export async function updateAdminDeliveryFee(
  id: string,
  input: DeliveryFeeUpdate,
): Promise<DeliveryFee> {
  const response = await apiRequest<ApiResponse<DeliveryFeeResponse>>(
    `/admin/delivery/fees/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.data.fee;
}

export async function toggleAdminDeliveryFee(id: string): Promise<DeliveryFee> {
  const response = await apiRequest<ApiResponse<DeliveryFeeResponse>>(
    `/admin/delivery/fees/${id}/toggle`,
    {
      method: "PATCH",
    },
  );

  return response.data.fee;
}

export async function duplicateAdminDeliveryFee(
  id: string,
): Promise<DeliveryFee> {
  const response = await apiRequest<ApiResponse<DeliveryFeeResponse>>(
    `/admin/delivery/fees/${id}/duplicate`,
    {
      method: "POST",
    },
  );

  return response.data.fee;
}

export async function deleteAdminDeliveryFee(id: string): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/admin/delivery/fees/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// DELIVERY SETTINGS
// ============================================

export async function getAdminDeliverySettings(): Promise<DeliverySettings> {
  const response = await apiRequest<ApiResponse<DeliverySettingsResponse>>(
    "/admin/delivery/settings",
  );

  return response.data.settings;
}

export async function updateAdminDeliverySettings(
  input: Partial<DeliverySettings>,
): Promise<DeliverySettings> {
  const response = await apiRequest<ApiResponse<DeliverySettingsResponse>>(
    "/admin/delivery/settings",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.data.settings;
}

// ============================================
// DELIVERY ZONES
// ============================================

export async function getAdminDeliveryZones(
  query: DeliveryZonesQuery,
): Promise<DeliveryZonesResponse> {
  const params = new URLSearchParams({
    search: query.search,
    state: query.state,
    status: query.status,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await apiRequest<ApiResponse<DeliveryZonesResponse>>(
    `/admin/delivery/zones?${params.toString()}`,
  );

  return response.data;
}

export async function createAdminDeliveryZone(
  input: DeliveryZoneInput,
): Promise<DeliveryZone> {
  const response = await apiRequest<ApiResponse<DeliveryZoneResponse>>(
    "/admin/delivery/zones",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data.zone;
}

export async function updateAdminDeliveryZone(
  id: string,
  input: DeliveryZoneUpdate,
): Promise<DeliveryZone> {
  const response = await apiRequest<ApiResponse<DeliveryZoneResponse>>(
    `/admin/delivery/zones/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.data.zone;
}

export async function toggleAdminDeliveryZone(
  id: string,
): Promise<DeliveryZone> {
  const response = await apiRequest<ApiResponse<DeliveryZoneResponse>>(
    `/admin/delivery/zones/${id}/toggle`,
    {
      method: "PATCH",
    },
  );

  return response.data.zone;
}

export async function deleteAdminDeliveryZone(id: string): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/admin/delivery/zones/${id}`, {
    method: "DELETE",
  });
}
