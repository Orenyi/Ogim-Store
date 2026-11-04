export type DashboardPeriod =
  | "today"
  | "7days"
  | "30days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export type DashboardOrderStatus =
  | "pending"
  | "processing"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface DashboardDateRange {
  startDate: string;
  endDate: string;
}

export interface DashboardStat {
  value: number;
  previousValue: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

export interface DashboardStats {
  totalRevenue: DashboardStat;
  totalOrders: DashboardStat;
  inStock: DashboardStat;
  pendingDispatch: DashboardStat;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface OrderStatusSummary {
  status: DashboardOrderStatus;
  count: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerInitials: string;
  itemSummary: string;
  total: number;
  status: DashboardOrderStatus;
  updatedAt: string;
}

export interface AdminDashboardResponse {
  stats: DashboardStats;
  revenue: RevenueDataPoint[];
  orderStatuses: OrderStatusSummary[];
  recentOrders: RecentOrder[];
}
