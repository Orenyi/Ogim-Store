export type DeliveryFeeStatus = "active" | "inactive";

export type DeliveryTab = "fees" | "zones" | "settings";

export interface DeliveryFee {
  id: string;
  location: string;
  state: string;
  country: string;
  fee: number;
  estimatedDelivery: string;
  status: DeliveryFeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  state: string;
  locations: string[];
  estimatedDelivery: string;
  status: DeliveryFeeStatus;
}

export interface DeliverySettings {
  defaultFee: number;
  freeDeliveryThreshold: number | null;
  currency: "NGN";
  allowStandardDelivery: boolean;
  allowExpressDelivery: boolean;
  expressDeliveryFee: number;
  defaultEstimatedDelivery: string;
}

export interface DeliveryFeeInput {
  location: string;
  state: string;
  country: string;
  fee: number;
  estimatedDelivery: string;
  status: DeliveryFeeStatus;
}

export interface DeliveryFeesQuery {
  search: string;
  state: string;
  status: DeliveryFeeStatus | "all";
  page: number;
  limit: number;
}

export interface DeliverySummary {
  totalLocations: number;
  activeFees: number;
  inactiveFees: number;
  defaultFee: number;
}

export interface DeliveryFeesResponse {
  fees: DeliveryFee[];
  summary: DeliverySummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type DeliveryFeeUpdate = Partial<DeliveryFeeInput>;
