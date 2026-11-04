export type TrackingStatus =
  | "processing"
  | "dispatched"
  | "in_transit"
  | "delivered";

export type TrackingFilterStatus = TrackingStatus | "all";

export type TrackingEventStatus = TrackingStatus | "placed";

export interface TrackingEvent {
  id: string;
  title: string;
  description: string;
  status: TrackingEventStatus;
  timestamp: string;
  note?: string;
}

export interface TrackingOrder {
  id: string;
  orderId: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    initials: string;
  };
  trackingNumber: string;
  deliveryPartner: string;
  status: TrackingStatus;
  destination: string;
  lastUpdatedAt: string;
  events: TrackingEvent[];
}

export interface TrackingSummary {
  totalTracked: number;
  inTransit: number;
  delivered: number;
  pendingUpdate: number;
  growth?: number;
}

export interface TrackingQuery {
  search: string;
  status: TrackingFilterStatus;
  partner: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export interface TrackingResponse {
  orders: TrackingOrder[];
  summary: TrackingSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrackingUpdateInput {
  orderId: string;
  status: TrackingStatus;
  note: string;
  trackingNumber?: string;
  deliveryPartner?: string;
}

export interface TrackingStatsProps {
  summary: TrackingSummary;
}
