const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let csrfToken: string | null = null;

// ============================================
// API TYPES
// ============================================

interface ApiResponse {
  success?: boolean;
  message?: string;
  csrfToken?: string;
  errors?: unknown;
}

export interface AuthMessageResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// ============================================
// CART API TYPES
// ============================================

export interface CartApiProduct {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  condition: "brand-new" | "uk-used" | "refurbished";
  stockQuantity: number;
  status: "draft" | "published" | "archived";
  images: {
    url: string;
    publicId?: string;
    alt: string;
  }[];
  specifications?: {
    storage?: string;
    ram?: string;
    color?: string;
    display?: string;
    battery?: string;
    camera?: string;
    operatingSystem?: string;
    network?: string;
    processor?: string;
    additionalFeatures?: string[];
  };
}

export interface CartApiItem {
  productId: CartApiProduct;
  quantity: number;
  priceAtAddition: number;
}

export interface CartApiData {
  _id: string;
  userId: string;
  items: CartApiItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartApiResponse {
  success: boolean;
  message?: string;
  data: CartApiData;
}

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

// Guest cart merge types

export interface GuestCartItemPayload {
  productId: string;
  quantity: number;
}

export interface MergeGuestCartPayload {
  items: GuestCartItemPayload[];
}

export interface RejectedCartItem {
  productId: string;
  reason: string;
}

export interface MergeGuestCartResponse extends CartApiResponse {
  rejectedItems: RejectedCartItem[];
}

// ============================================
// API ERROR
// ============================================

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// ============================================
// CSRF TOKEN
// ============================================

export async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  let result: ApiResponse;

  try {
    result = (await response.json()) as ApiResponse;
  } catch {
    throw new ApiError(
      "Unable to initialize secure session. Check the API URL and backend.",
      response.status,
    );
  }

  if (!response.ok || typeof result.csrfToken !== "string") {
    throw new ApiError(
      result.message || "Unable to initialize secure session.",
      response.status,
    );
  }

  csrfToken = result.csrfToken;

  return csrfToken;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

// ============================================
// BASE API REQUEST
// ============================================

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();

  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (isMutation && !csrfToken) {
    await getCsrfToken();
  }

  const headers = new Headers(options?.headers);

  headers.set("Accept", "application/json");

  if (options?.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (isMutation && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new ApiError(
      `Expected JSON from ${API_BASE_URL}${endpoint}. Check your API URL and backend port.`,
      response.status,
    );
  }

  const result = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new ApiError(
      result.message || "Something went wrong.",
      response.status,
      result.errors,
    );
  }

  return result as T;
}

// ============================================
// AUTHENTICATION
// ============================================

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<AuthMessageResponse> {
  return apiRequest<AuthMessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<AuthMessageResponse> {
  return apiRequest<AuthMessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ============================================
// CUSTOMER CART API
// ============================================

/**
 * Fetch the authenticated customer's cart.
 */
export async function getCart(): Promise<CartApiResponse> {
  return apiRequest<CartApiResponse>("/cart");
}

/**
 * Add a product to the authenticated customer's cart.
 */
export async function addCartItem(
  payload: AddCartItemPayload,
): Promise<CartApiResponse> {
  return apiRequest<CartApiResponse>("/cart/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a product's quantity in the cart.
 */
export async function updateCartItem(
  productId: string,
  payload: UpdateCartItemPayload,
): Promise<CartApiResponse> {
  return apiRequest<CartApiResponse>(
    `/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Remove a product from the authenticated customer's cart.
 */
export async function removeCartItem(
  productId: string,
): Promise<CartApiResponse> {
  return apiRequest<CartApiResponse>(
    `/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Clear the authenticated customer's cart.
 */
export async function clearCart(): Promise<CartApiResponse> {
  return apiRequest<CartApiResponse>("/cart", {
    method: "DELETE",
  });
}

/**
 * Merge a guest's locally stored cart into the authenticated customer's cart.
 *
 * The backend validates product availability and stock.
 * Rejected items are returned separately by the backend.
 */
export async function mergeGuestCart(
  payload: MergeGuestCartPayload,
): Promise<MergeGuestCartResponse> {
  return apiRequest<MergeGuestCartResponse>("/cart/merge", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
