export type OrderFulfilmentStatus =
  | "pending_dispatch"
  | "processing"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type OrderPaymentMethod =
  | "paystack"
  | "bank_transfer"
  | "cash_on_delivery";

export interface AdminOrderCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  initials: string;
}

export interface AdminOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  condition?: "brand_new" | "uk_used" | "refurbished";
  image?: string;
  variant?: string;
}

export interface OrderAddress {
  recipient: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
}

export interface OrderDelivery {
  method: string;
  fee: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  courier?: string;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string | null;
  status: "completed" | "current" | "upcoming";
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: AdminOrderCustomer;
  items: AdminOrderItem[];
  itemSummary: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: OrderPaymentMethod;
  paymentReference?: string;
  paymentDate?: string;
  fulfilmentStatus: OrderFulfilmentStatus;
  deliveryAddress?: OrderAddress;
  delivery?: OrderDelivery;
  timeline?: OrderTimelineEvent[];
  orderedAt: string;
  updatedAt: string;
}

export interface OrdersSummary {
  allOrders: number;
  processing: number;
  inTransit: number;
  delivered: number;
  pendingDispatch: number;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  summary: OrdersSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminOrdersQuery {
  page: number;
  limit: number;
  search?: string;
  fulfilmentStatus?: OrderFulfilmentStatus | "all";
  paymentStatus?: OrderPaymentStatus | "all";
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderFulfilmentStatus;
  note?: string;
}

export interface OrderListFilters {
  search: string;
  fulfilmentStatus: OrderFulfilmentStatus | "all";
  paymentStatus: OrderPaymentStatus | "all";
  startDate: string;
  endDate: string;
}
