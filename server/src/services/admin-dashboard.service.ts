import type { PipelineStage } from "mongoose";

import OrderModel from "../models/Order.js";
import Payment from "../models/Payment.js";
import ProductModel from "../models/product.model.js";
import User from "../models/User.js";

// ============================================
// CONSTANTS
// ============================================

const REPORT_TIMEZONE = "Africa/Lagos";
const UTC_OFFSET_MINUTES = 60;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_ORDER_LIMIT = 5;
const REVENUE_CHART_DAYS = 30;

// ============================================
// TYPES
// ============================================

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

interface DashboardPayment {
  _id: unknown;
  status: string;
  amount: number;
  paidAt?: Date;
  verifiedAt?: Date;
  refundStatus?: string;
  refundAmount?: number;
}

interface DashboardOrderRecord {
  _id: unknown;
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  total: number;
  deliveryFee: number;
  status: string;
  fulfilmentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  reportDate: Date;
  canonicalPayment: DashboardPayment;
}

interface RecentOrderRecord {
  _id: unknown;
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
  }[];
  total: number;
  status: string;
  paymentStatus: string;
  fulfilmentStatus?: string;
  updatedAt: Date;
  createdAt: Date;
  deliveryAddress?: {
    fullName?: string;
  };
  canonicalPayment?: DashboardPayment | null;
  customerRecord?: {
    fullName?: string;
    deletedAt?: Date | null;
  } | null;
}

type DashboardOrderStatus =
  | "pending"
  | "processing"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

interface ProcessedOrder {
  revenue: number;
  fullyRefunded: boolean;
}

// ============================================
// DATE HELPERS
// ============================================

function getLagosDateParts(date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function lagosDateToUTC(parts: DateParts): Date {
  const timestamp =
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour ?? 0,
      parts.minute ?? 0,
      parts.second ?? 0,
    ) -
    UTC_OFFSET_MINUTES * 60 * 1000;

  return new Date(timestamp);
}

function startOfLagosDay(date: Date): Date {
  const parts = getLagosDateParts(date);

  return lagosDateToUTC({
    year: parts.year,
    month: parts.month,
    day: parts.day,
  });
}

function startOfLagosMonth(date: Date): Date {
  const parts = getLagosDateParts(date);

  return lagosDateToUTC({
    year: parts.year,
    month: parts.month,
    day: 1,
  });
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function shiftLagosDate(date: Date, months: number, years = 0): Date {
  const parts = getLagosDateParts(date);

  const targetMonthDate = new Date(
    Date.UTC(parts.year + years, parts.month - 1 + months, 1),
  );

  const targetYear = targetMonthDate.getUTCFullYear();
  const targetMonth = targetMonthDate.getUTCMonth() + 1;

  const targetDay = Math.min(parts.day, daysInMonth(targetYear, targetMonth));

  return lagosDateToUTC({
    year: targetYear,
    month: targetMonth,
    day: targetDay,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  });
}

function getMonthRange(now: Date) {
  const currentStart = startOfLagosMonth(now);
  const previousStart = shiftLagosDate(currentStart, -1);
  const previousEnd = shiftLagosDate(now, -1);

  return {
    currentStart,
    currentEnd: now,
    previousStart,
    previousEnd,
  };
}

function getDateKey(date: Date): string {
  const parts = getLagosDateParts(date);

  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

// ============================================
// MONEY HELPERS
// ============================================

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return roundMoney(((current - previous) / previous) * 100);
}

function getTrend(
  current: number,
  previous: number,
): "up" | "down" | "neutral" {
  if (current > previous) return "up";
  if (current < previous) return "down";

  return "neutral";
}

function createStat(current: number, previous: number) {
  return {
    value: current,
    previousValue: previous,
    percentageChange: calculatePercentageChange(current, previous),
    trend: getTrend(current, previous),
  };
}

// ============================================
// PAYMENT / REFUND CALCULATION
// ============================================

function processPaidOrder(order: DashboardOrderRecord): ProcessedOrder {
  const payment = order.canonicalPayment;

  const refundAmount =
    payment.refundStatus === "success"
      ? Math.max(0, Number(payment.refundAmount ?? 0) / 100)
      : 0;

  const paymentAmount = Math.max(0, Number(payment.amount ?? 0) / 100);

  const fullyRefunded =
    payment.refundStatus === "success" &&
    paymentAmount > 0 &&
    Number(payment.refundAmount ?? 0) >= Number(payment.amount);

  const merchandiseSubtotal = Math.max(0, Number(order.subtotal ?? 0));

  const refundApplied = Math.min(refundAmount, merchandiseSubtotal);

  return {
    revenue: fullyRefunded
      ? 0
      : roundMoney(merchandiseSubtotal - refundApplied),
    fullyRefunded,
  };
}

// ============================================
// PAID ORDER AGGREGATION
// ============================================

function getPaidOrdersPipeline(start?: Date, end?: Date): PipelineStage[] {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        paidPaymentId: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $lookup: {
        from: Payment.collection.name,
        localField: "paidPaymentId",
        foreignField: "_id",
        as: "canonicalPayment",
      },
    },
    {
      $unwind: "$canonicalPayment",
    },
    {
      $match: {
        "canonicalPayment.status": "success",
      },
    },
    {
      $addFields: {
        reportDate: {
          $ifNull: [
            "$canonicalPayment.paidAt",
            {
              $ifNull: ["$canonicalPayment.verifiedAt", "$createdAt"],
            },
          ],
        },
      },
    },
  ];

  if (start && end) {
    pipeline.push({
      $match: {
        reportDate: {
          $gte: start,
          $lt: end,
        },
      },
    });
  }

  pipeline.push({
    $project: {
      orderNumber: 1,
      items: 1,
      subtotal: 1,
      total: 1,
      deliveryFee: 1,
      status: 1,
      fulfilmentStatus: 1,
      createdAt: 1,
      updatedAt: 1,
      reportDate: 1,
      canonicalPayment: 1,
    },
  });

  return pipeline;
}

async function getPaidOrders(
  start?: Date,
  end?: Date,
): Promise<DashboardOrderRecord[]> {
  return OrderModel.aggregate<DashboardOrderRecord>(
    getPaidOrdersPipeline(start, end),
  );
}

// ============================================
// REVENUE STATISTICS
// ============================================

function calculateRevenueAndOrders(orders: DashboardOrderRecord[]) {
  let revenue = 0;
  let totalOrders = 0;

  for (const order of orders) {
    const processed = processPaidOrder(order);

    if (processed.fullyRefunded) {
      continue;
    }

    revenue += processed.revenue;
    totalOrders += 1;
  }

  return {
    revenue: roundMoney(revenue),
    totalOrders,
  };
}

async function getRevenueStats() {
  const range = getMonthRange(new Date());

  const [currentOrders, previousOrders] = await Promise.all([
    getPaidOrders(range.currentStart, range.currentEnd),
    getPaidOrders(range.previousStart, range.previousEnd),
  ]);

  const current = calculateRevenueAndOrders(currentOrders);
  const previous = calculateRevenueAndOrders(previousOrders);

  return {
    totalRevenue: createStat(current.revenue, previous.revenue),
    totalOrders: createStat(current.totalOrders, previous.totalOrders),
  };
}

// ============================================
// INVENTORY STATISTICS
// ============================================

async function getInventoryStats() {
  const result = await ProductModel.aggregate<{
    totalStock: number;
  }>([
    {
      $match: {
        status: "published",
      },
    },
    {
      $group: {
        _id: null,
        totalStock: {
          $sum: "$stockQuantity",
        },
      },
    },
  ]);

  const totalStock = Math.max(0, Number(result[0]?.totalStock ?? 0));

  // Historical stock snapshots are not currently stored.
  // Do not manufacture a historical comparison.
  return createStat(totalStock, totalStock);
}

// ============================================
// PENDING DISPATCH STATISTICS
// ============================================

async function getPendingDispatchStats() {
  const result = await OrderModel.aggregate<{
    count: number;
  }>([
    {
      $match: {
        fulfilmentStatus: "pending_dispatch",
        paidPaymentId: {
          $exists: true,
          $ne: null,
        },
      },
    },
    {
      $lookup: {
        from: Payment.collection.name,
        localField: "paidPaymentId",
        foreignField: "_id",
        as: "canonicalPayment",
      },
    },
    {
      $unwind: "$canonicalPayment",
    },
    {
      $match: {
        "canonicalPayment.status": "success",
        $expr: {
          $not: [
            {
              $and: [
                {
                  $eq: ["$canonicalPayment.refundStatus", "success"],
                },
                {
                  $gte: [
                    "$canonicalPayment.refundAmount",
                    "$canonicalPayment.amount",
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $count: "count",
    },
  ]);

  const count = Number(result[0]?.count ?? 0);

  // Historical queue snapshots are not currently stored.
  return createStat(count, count);
}

// ============================================
// REVENUE CHART
// ============================================

function buildRevenueChart(orders: DashboardOrderRecord[]) {
  const now = new Date();
  const todayStart = startOfLagosDay(now);

  const start = addDays(todayStart, -(REVENUE_CHART_DAYS - 1));

  const revenueByDate = new Map<string, number>();

  // Initialize every date, including zero-sales dates.
  for (let index = 0; index < REVENUE_CHART_DAYS; index += 1) {
    const date = addDays(start, index);

    revenueByDate.set(getDateKey(date), 0);
  }

  for (const order of orders) {
    const processed = processPaidOrder(order);

    if (processed.fullyRefunded) {
      continue;
    }

    const key = getDateKey(order.reportDate);

    if (!revenueByDate.has(key)) {
      continue;
    }

    revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + processed.revenue);
  }

  return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
    // ISO date allows the frontend to format any month/year.
    date,
    revenue: roundMoney(revenue),
  }));
}

async function getRevenueChart() {
  const now = new Date();
  const todayStart = startOfLagosDay(now);

  const start = addDays(todayStart, -(REVENUE_CHART_DAYS - 1));

  const end = addDays(todayStart, 1);

  const orders = await getPaidOrders(start, end);

  return buildRevenueChart(orders);
}

// ============================================
// ORDER STATUS
// ============================================

function getDashboardOrderStatus(order: {
  status: string;
  fulfilmentStatus?: string;
  paymentStatus?: string;
  canonicalPayment?: DashboardPayment | null;
}): DashboardOrderStatus {
  const payment = order.canonicalPayment;

  const isFullyRefunded =
    payment?.refundStatus === "success" &&
    Number(payment.refundAmount ?? 0) >= Number(payment.amount ?? 0) &&
    Number(payment.amount ?? 0) > 0;

  if (isFullyRefunded || order.paymentStatus === "refunded") {
    return "refunded";
  }

  if (order.status === "cancelled" || order.fulfilmentStatus === "cancelled") {
    return "cancelled";
  }

  if (order.fulfilmentStatus === "delivered" || order.status === "fulfilled") {
    return "delivered";
  }

  if (order.fulfilmentStatus === "in_transit") {
    return "in_transit";
  }

  if (order.fulfilmentStatus === "dispatched") {
    return "dispatched";
  }

  if (order.fulfilmentStatus === "processing") {
    return "processing";
  }

  return "pending";
}

async function getOrderStatusSummary() {
  // MongoDB's $group stage returns the grouped value as _id.
  const result = await OrderModel.aggregate<{
    _id: DashboardOrderStatus;
    count: number;
  }>([
    {
      $lookup: {
        from: Payment.collection.name,
        localField: "paidPaymentId",
        foreignField: "_id",
        as: "canonicalPayment",
      },
    },
    {
      $unwind: {
        path: "$canonicalPayment",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        dashboardStatus: {
          $switch: {
            branches: [
              {
                case: {
                  $or: [
                    {
                      $eq: ["$paymentStatus", "refunded"],
                    },
                    {
                      $and: [
                        {
                          $eq: ["$canonicalPayment.refundStatus", "success"],
                        },
                        {
                          $gt: ["$canonicalPayment.amount", 0],
                        },
                        {
                          $gte: [
                            "$canonicalPayment.refundAmount",
                            "$canonicalPayment.amount",
                          ],
                        },
                      ],
                    },
                  ],
                },
                then: "refunded",
              },
              {
                case: {
                  $or: [
                    {
                      $eq: ["$status", "cancelled"],
                    },
                    {
                      $eq: ["$fulfilmentStatus", "cancelled"],
                    },
                  ],
                },
                then: "cancelled",
              },
              {
                case: {
                  $or: [
                    {
                      $eq: ["$fulfilmentStatus", "delivered"],
                    },
                    {
                      $eq: ["$status", "fulfilled"],
                    },
                  ],
                },
                then: "delivered",
              },
              {
                case: {
                  $eq: ["$fulfilmentStatus", "in_transit"],
                },
                then: "in_transit",
              },
              {
                case: {
                  $eq: ["$fulfilmentStatus", "dispatched"],
                },
                then: "dispatched",
              },
              {
                case: {
                  $eq: ["$fulfilmentStatus", "processing"],
                },
                then: "processing",
              },
            ],
            default: "pending",
          },
        },
      },
    },
    {
      $group: {
        _id: "$dashboardStatus",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const statuses: DashboardOrderStatus[] = [
    "pending",
    "processing",
    "dispatched",
    "in_transit",
    "delivered",
    "cancelled",
    "refunded",
  ];

  const counts = new Map<DashboardOrderStatus, number>(
    result.map((item) => [item._id, item.count]),
  );

  const total = result.reduce((sum, item) => sum + item.count, 0);

  return statuses.map((status) => {
    const count = counts.get(status) ?? 0;

    return {
      status,
      count,
      percentage: total > 0 ? roundMoney((count / total) * 100) : 0,
    };
  });
}

// ============================================
// RECENT ORDER HELPERS
// ============================================

function getCustomerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatRelativeTime(date: Date): string {
  const difference = Math.max(0, Date.now() - new Date(date).getTime());

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: REPORT_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getItemSummary(items: RecentOrderRecord["items"]): string {
  if (!items?.length) {
    return "No items";
  }

  const firstItem = items[0].name;

  if (items.length === 1) {
    return firstItem;
  }

  return `${firstItem} + ${items.length - 1} more`;
}

function mapRecentOrder(order: RecentOrderRecord) {
  const customerName = order.customerRecord?.deletedAt
    ? "Deleted Customer"
    : order.customerRecord?.fullName ||
      order.deliveryAddress?.fullName ||
      "Unknown Customer";

  const payment = order.canonicalPayment;

  const refundAmount =
    payment?.refundStatus === "success"
      ? Math.max(0, Number(payment.refundAmount ?? 0) / 100)
      : 0;

  const netCustomerTotal = Math.max(0, Number(order.total ?? 0) - refundAmount);

  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    customerName,
    customerInitials: getCustomerInitials(customerName),
    itemSummary: getItemSummary(order.items),
    total: roundMoney(netCustomerTotal),
    status: getDashboardOrderStatus(order),
    updatedAt: formatRelativeTime(order.updatedAt ?? order.createdAt),
  };
}

async function getRecentOrders() {
  const orders = await OrderModel.aggregate<RecentOrderRecord>([
    {
      $sort: {
        updatedAt: -1,
        _id: -1,
      },
    },
    {
      $limit: RECENT_ORDER_LIMIT,
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: "userId",
        foreignField: "_id",
        as: "customerRecord",
      },
    },
    {
      $unwind: {
        path: "$customerRecord",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: Payment.collection.name,
        localField: "paidPaymentId",
        foreignField: "_id",
        as: "canonicalPayment",
      },
    },
    {
      $unwind: {
        path: "$canonicalPayment",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        orderNumber: 1,
        items: 1,
        total: 1,
        status: 1,
        paymentStatus: 1,
        fulfilmentStatus: 1,
        updatedAt: 1,
        createdAt: 1,
        deliveryAddress: 1,
        canonicalPayment: 1,
        customerRecord: 1,
      },
    },
  ]);

  return orders.map(mapRecentOrder);
}

// ============================================
// MAIN ADMIN DASHBOARD SERVICE
// ============================================

export async function getAdminDashboardSummary() {
  const [
    revenueStats,
    inventoryStats,
    pendingDispatchStats,
    revenue,
    orderStatuses,
    recentOrders,
  ] = await Promise.all([
    getRevenueStats(),
    getInventoryStats(),
    getPendingDispatchStats(),
    getRevenueChart(),
    getOrderStatusSummary(),
    getRecentOrders(),
  ]);

  return {
    stats: {
      totalRevenue: revenueStats.totalRevenue,
      totalOrders: revenueStats.totalOrders,
      inStock: inventoryStats,
      pendingDispatch: pendingDispatchStats,
    },

    revenue,
    orderStatuses,
    recentOrders,
  };
}
