export type RevenuePeriod =
  | "today"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-year"
  | "custom";

export type RevenueChartMode = "revenue" | "orders";

export interface RevenueDateRange {
  period: RevenuePeriod;
  startDate?: string;
  endDate?: string;
}

export interface RevenueMetric {
  value: number;
  previousValue: number;
  percentageChange: number;
}

export interface RevenueSummary {
  totalRevenue: RevenueMetric;
  totalOrders: RevenueMetric;
  unitsSold: RevenueMetric;
  averageOrderValue: RevenueMetric;
}

export interface RevenueChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface SalesCategory {
  id: string;
  name: string;
  percentage: number;
  revenue: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  image: string;
  variant: string;
  unitsSold: number;
  revenue: number;
}

export type RevenueOrderStatus =
  | "processing"
  | "dispatched"
  | "in-transit"
  | "delivered"
  | "cancelled";

export interface RevenueOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: RevenueOrderStatus;
  orderedAt: string;
}

export interface RevenueReport {
  summary: RevenueSummary;
  chart: RevenueChartPoint[];
  categories: SalesCategory[];
  topProducts: TopSellingProduct[];
  recentOrders: RevenueOrder[];
}
