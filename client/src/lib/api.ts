const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let csrfToken: string | null = null;

// ============================================
// GENERAL API TYPES
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
// ORDER API TYPES
// ============================================

export type OrderDeliveryMethod = "standard" | "express" | "same-day";

export type OrderCondition = "brand-new" | "uk-used" | "refurbished";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "fulfilled";

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
}

export interface OrderDeliveryAddressPayload {
  fullName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  instructions?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  deliveryAddress: OrderDeliveryAddressPayload;
  deliveryMethod: OrderDeliveryMethod;
}

export interface OrderApiItem {
  productId: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  condition: OrderCondition;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderApiRecord {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderApiItem[];
  deliveryAddress: OrderDeliveryAddressPayload;
  deliveryMethod: OrderDeliveryMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "NGN";
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paidPaymentId: string | null;
  paymentReference: string | null;
  reservationExpiresAt: string;
  stockRestoredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: OrderApiRecord;
    reservationExpiresAt: string;
  };
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  data: OrderApiRecord;
}

// ============================================
// CUSTOMER ORDER HISTORY RESPONSE TYPES
// ============================================

export interface CustomerOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: OrderApiRecord[];
    total: number;
  };
}

export interface CustomerOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: OrderApiRecord;
  };
}

// ============================================
// PAYSTACK PAYMENT TYPES
// ============================================

export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    reference: string;
    amount: number;
    currency: "NGN";
    authorizationUrl: string;
    reservationExpiresAt: string;
  };
}

export type PaymentAttemptStatus =
  | "initializing"
  | "pending"
  | "success"
  | "failed"
  | "abandoned"
  | "expired"
  | "refunded";

export interface PaymentVerificationData {
  verified: boolean;
  paymentStatus: PaymentAttemptStatus;
  orderStatus: OrderStatus;
  orderId: string;
  orderNumber: string;
  reference: string;
  amount: number;
  currency: "NGN";
  message: string;
  order: OrderApiRecord;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: PaymentVerificationData;
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

/**
 * Delete the authenticated customer's account.
 *
 * The backend performs a transactional soft deletion:
 * - Anonymizes personal account information.
 * - Disables the customer account.
 * - Revokes active refresh sessions.
 * - Invalidates outstanding password-reset tokens.
 * - Preserves historical orders and payment records.
 *
 * Authentication cookies are cleared by the backend.
 * The frontend also clears its cached CSRF token.
 */
export async function deleteCustomerAccount(): Promise<AuthMessageResponse> {
  const response = await apiRequest<AuthMessageResponse>("/auth/account", {
    method: "DELETE",
  });

  clearCsrfToken();

  return response;
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
 */
export async function mergeGuestCart(
  payload: MergeGuestCartPayload,
): Promise<MergeGuestCartResponse> {
  return apiRequest<MergeGuestCartResponse>("/cart/merge", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ============================================
// CUSTOMER ORDER API
// ============================================

/**
 * Fetch all orders belonging to the authenticated customer.
 */
export async function getCustomerOrders(): Promise<CustomerOrdersResponse> {
  return apiRequest<CustomerOrdersResponse>("/orders");
}

/**
 * Fetch one order belonging to the authenticated customer.
 */
export async function getCustomerOrderById(
  orderId: string,
): Promise<CustomerOrderResponse> {
  return apiRequest<CustomerOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}`,
  );
}

/**
 * Create a pending order from the customer's cart.
 */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Initialize Paystack payment for an existing pending order.
 */
export async function initializeOrderPayment(
  orderId: string,
): Promise<InitializePaymentResponse> {
  return apiRequest<InitializePaymentResponse>(
    `/orders/${encodeURIComponent(orderId)}/pay`,
    {
      method: "POST",
    },
  );
}

/**
 * Verify a Paystack payment and retrieve the complete order.
 */
export async function verifyOrderPayment(
  orderId: string,
  reference: string,
): Promise<PaymentVerificationResponse> {
  return apiRequest<PaymentVerificationResponse>(
    `/orders/${encodeURIComponent(orderId)}/verify-payment`,
    {
      method: "POST",
      body: JSON.stringify({ reference }),
    },
  );
}

/**
 * Cancel a pending order.
 */
export async function cancelOrder(
  orderId: string,
): Promise<CancelOrderResponse> {
  return apiRequest<CancelOrderResponse>(
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: "POST",
    },
  );
}
