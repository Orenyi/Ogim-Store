export type DispatchStatus =
  | "pending"
  | "dispatched"
  | "in_transit"
  | "delivered";

export type DeliveryPartner =
  | "GIGL Logistics"
  | "Sendbox"
  | "Ogim Delivery"
  | "DHL"
  | "Other";

// ============================================
// ELIGIBLE ORDER FOR DISPATCH
// ============================================

export interface EligibleDispatchOrder {
  id: string;
  orderNumber: string;

  customer: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };

  destination: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
  };

  productSummary: string;
  itemCount: number;
  total: number;
  createdAt: string;
}

// ============================================
// DISPATCH ORDER
// ============================================

export interface DispatchOrder {
  id: string;
  orderId: string;
  orderNumber: string;

  customer: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
  };

  destination: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
  };

  productSummary: string;
  itemCount: number;
  total: number;

  deliveryPartner: DeliveryPartner | null;
  trackingNumber: string | null;

  status: DispatchStatus;

  dispatchedAt: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// DISPATCH SUMMARY
// ============================================

export interface DispatchSummary {
  pending: number;
  dispatched: number;
  inTransit: number;
  delivered: number;
  total: number;
}

// ============================================
// DISPATCH QUERY
// ============================================

export interface DispatchQuery {
  search: string;
  status: DispatchStatus | "all";
  partner: DeliveryPartner | "all";
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

// ============================================
// DISPATCH RESPONSE
// ============================================

export interface DispatchResponse {
  dispatches: DispatchOrder[];
  summary: DispatchSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// ASSIGN DISPATCH
// ============================================

export interface AssignDispatchInput {
  orderId: string;
  deliveryPartner: DeliveryPartner;
  trackingNumber: string;
  estimatedDelivery: string;
}

// ============================================
// UPDATE DISPATCH STATUS
// ============================================

export interface UpdateDispatchStatusInput {
  dispatchId: string;
  status: DispatchStatus;
}
