import type { PipelineStage } from "mongoose";

import OrderModel from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// ============================================
// TYPES
// ============================================
export type RevenuePeriod =
  | "today"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-year"
  | "custom";

export interface AdminRevenueQuery {
  period: RevenuePeriod;
  startDate?: string;
  endDate?: string;
}

interface DateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

interface RevenueOrderItem {
  productId: unknown;
  name: string;
  slug?: string;
  brand?: string;
  model?: string;
  condition?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  categoryId?: unknown;
  categoryName?: string;
}

interface RevenuePayment {
  _id: unknown;
  status: string;
  amount: number;
  currency: string;
  paidAt?: Date;
  verifiedAt?: Date;
  refundStatus?: string;
  refundAmount?: number;
}

interface RevenueOrderRecord {
  _id: unknown;
  orderNumber: string;
  items: RevenueOrderItem[];
  userId: unknown;
  deliveryAddress?: {
    fullName?: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  fulfilmentStatus?: string;
  createdAt: Date;
  reportDate: Date;
  canonicalPayment: RevenuePayment;
  customerRecord?: {
    fullName?: string;
    deletedAt?: Date | null;
  } | null;
}

interface RevenueAccumulator {
  revenue: number;
  orders: number;
}

interface ProductAccumulator {
  id: string;
  name: string;
  image: string;
  variant: string;
  unitsSold: number;
  revenue: number;
}

interface CategoryAccumulator {
  id: string;
  name: string;
  revenue: number;
}

interface ChartBucket {
  key: string;
  label: string;
}

interface ProcessedOrder {
  order: RevenueOrderRecord;
  netRevenue: number;
  refundApplied: number;
  fullyRefunded: boolean;
}

interface RevenueMetrics {
  revenue: number;
  orders: number;
  units: number;
  averageOrderValue: number;
}

// ============================================
// CONSTANTS
// ============================================

const REPORT_TIMEZONE = "Africa/Lagos";
const LAGOS_UTC_OFFSET_MINUTES = 60;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const RECENT_ORDER_LIMIT = 5;
const TOP_PRODUCT_LIMIT = 5;

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

/**
 * Converts Lagos wall-clock time to a UTC Date.
 *
 * Africa/Lagos currently uses UTC+1 without daylight
 * saving time.
 */
function lagosDateToUTC(parts: DateParts): Date {
  const utcTimestamp =
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour ?? 0,
      parts.minute ?? 0,
      parts.second ?? 0,
    ) -
    LAGOS_UTC_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcTimestamp);
}

function startOfLagosDay(date: Date): Date {
  const parts = getLagosDateParts(date);

  return lagosDateToUTC({
    year: parts.year,
    month: parts.month,
    day: parts.day,
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

function getWeekStart(date: Date): Date {
  const dayStart = startOfLagosDay(date);
  const parts = getLagosDateParts(dayStart);

  const weekday = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).getUTCDay();

  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;

  return addDays(dayStart, -daysSinceMonday);
}

function parseDateInput(value: string, fieldName: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${fieldName}. Use YYYY-MM-DD format.`);
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return lagosDateToUTC({ year, month, day });
}

// ============================================
// REPORT DATE RANGE
// ============================================

function getDateRange(query: AdminRevenueQuery): DateRange {
  const now = new Date();
  const todayStart = startOfLagosDay(now);

  switch (query.period) {
    case "today": {
      return {
        start: todayStart,
        end: now,
        previousStart: addDays(todayStart, -1),
        previousEnd: new Date(now.getTime() - DAY_IN_MS),
      };
    }

    case "this-week": {
      const start = getWeekStart(now);

      return {
        start,
        end: now,
        previousStart: addDays(start, -7),
        previousEnd: new Date(now.getTime() - 7 * DAY_IN_MS),
      };
    }

    case "this-month": {
      const parts = getLagosDateParts(now);

      const start = lagosDateToUTC({
        year: parts.year,
        month: parts.month,
        day: 1,
      });

      const previousStart = shiftLagosDate(start, -1);
      const previousEnd = shiftLagosDate(now, -1);

      return {
        start,
        end: now,
        previousStart,
        previousEnd,
      };
    }

    case "last-month": {
      const parts = getLagosDateParts(now);

      const startOfCurrentMonth = lagosDateToUTC({
        year: parts.year,
        month: parts.month,
        day: 1,
      });

      const previousStart = shiftLagosDate(startOfCurrentMonth, -2);

      return {
        start: shiftLagosDate(startOfCurrentMonth, -1),
        end: startOfCurrentMonth,
        previousStart,
        previousEnd: shiftLagosDate(startOfCurrentMonth, -1),
      };
    }

    case "this-year": {
      const parts = getLagosDateParts(now);

      return {
        start: lagosDateToUTC({
          year: parts.year,
          month: 1,
          day: 1,
        }),
        end: now,
        previousStart: lagosDateToUTC({
          year: parts.year - 1,
          month: 1,
          day: 1,
        }),
        previousEnd: shiftLagosDate(now, 0, -1),
      };
    }

    case "custom": {
      if (!query.startDate || !query.endDate) {
        throw new Error(
          "Both startDate and endDate are required for a custom report.",
        );
      }

      const start = parseDateInput(query.startDate, "start date");
      const selectedEnd = parseDateInput(query.endDate, "end date");

      if (start > selectedEnd) {
        throw new Error("Start date cannot be after end date.");
      }

      const end = addDays(selectedEnd, 1);
      const duration = end.getTime() - start.getTime();

      return {
        start,
        end,
        previousStart: new Date(start.getTime() - duration),
        previousEnd: start,
      };
    }

    default:
      throw new Error("Unsupported revenue reporting period.");
  }
}

// ============================================
// MONGO AGGREGATION
// ============================================

function getRevenueOrderPipeline(start: Date, end: Date): PipelineStage[] {
  return [
    // Only orders with a canonical payment are eligible.
    {
      $match: {
        paidPaymentId: {
          $exists: true,
          $ne: null,
        },
      },
    },

    // Resolve the canonical payment.
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

    // Failed and duplicate payment attempts cannot contribute.
    {
      $match: {
        "canonicalPayment.status": "success",
      },
    },

    // Sales are grouped by the actual successful payment date.
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

    {
      $match: {
        reportDate: {
          $gte: start,
          $lt: end,
        },
      },
    },

    // Customer details for recent orders.
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
      $project: {
        orderNumber: 1,
        items: 1,
        userId: 1,
        deliveryAddress: 1,
        subtotal: 1,
        deliveryFee: 1,
        total: 1,
        status: 1,
        fulfilmentStatus: 1,
        createdAt: 1,
        reportDate: 1,
        canonicalPayment: 1,
        customerRecord: 1,
      },
    },
  ];
}

// ============================================
// REVENUE CALCULATION
// ============================================

function calculateOrderRevenue(order: RevenueOrderRecord): ProcessedOrder {
  const payment = order.canonicalPayment;

  const refundAmount =
    payment.refundStatus === "success"
      ? Math.max(0, Number(payment.refundAmount ?? 0) / 100)
      : 0;

  const subtotal = Math.max(0, Number(order.subtotal ?? 0));

  const fullyRefunded =
    payment.refundStatus === "success" &&
    Number(payment.refundAmount ?? 0) >= Number(payment.amount);

  // Delivery fees are deliberately excluded from merchandise revenue.
  const refundApplied = Math.min(refundAmount, subtotal);

  const netRevenue = Math.max(0, subtotal - refundApplied);

  return {
    order,
    netRevenue,
    refundApplied,
    fullyRefunded,
  };
}

function allocateRefund(
  lineTotal: number,
  subtotal: number,
  refundApplied: number,
): number {
  if (subtotal <= 0 || refundApplied <= 0) {
    return 0;
  }

  return refundApplied * (Math.max(0, lineTotal) / subtotal);
}

function getOrderUnits(order: RevenueOrderRecord): number {
  return (order.items ?? []).reduce(
    (total, item) => total + Math.max(0, Number(item.quantity ?? 0)),
    0,
  );
}

// ============================================
// METRIC CALCULATIONS
// ============================================

function calculateMetrics(orders: RevenueOrderRecord[]): RevenueMetrics {
  const processedOrders = orders.map(calculateOrderRevenue);

  const qualifyingOrders = processedOrders.filter(
    (item) => !item.fullyRefunded,
  );

  const revenue = qualifyingOrders.reduce(
    (total, item) => total + item.netRevenue,
    0,
  );

  const units = qualifyingOrders.reduce(
    (total, item) => total + getOrderUnits(item.order),
    0,
  );

  const count = qualifyingOrders.length;

  return {
    revenue: roundMoney(revenue),
    orders: count,
    units,
    averageOrderValue: count > 0 ? roundMoney(revenue / count) : 0,
  };
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculatePercentageChange(
  currentValue: number,
  previousValue: number,
): number {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return roundMoney(((currentValue - previousValue) / previousValue) * 100);
}

function createMetric(currentValue: number, previousValue: number) {
  return {
    value: currentValue,
    previousValue,
    percentageChange: calculatePercentageChange(currentValue, previousValue),
  };
}

// ============================================
// CHART BUCKETS
// ============================================

function formatChartDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: REPORT_TIMEZONE,
    ...options,
  }).format(date);
}

function getDateKey(date: Date): string {
  const parts = getLagosDateParts(date);

  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

function getChartBuckets(
  query: AdminRevenueQuery,
  range: DateRange,
): ChartBucket[] {
  const buckets: ChartBucket[] = [];

  if (query.period === "today") {
    for (let hour = 0; hour < 24; hour += 1) {
      const date = new Date(range.start.getTime() + hour * 60 * 60 * 1000);

      buckets.push({
        key: `${getDateKey(date)}-${String(hour).padStart(2, "0")}`,
        label: formatChartDate(date, {
          hour: "numeric",
          hour12: true,
        }),
      });
    }

    return buckets;
  }

  const rangeParts = getLagosDateParts(range.start);
  const endParts = getLagosDateParts(range.end);

  const durationDays = Math.ceil(
    (range.end.getTime() - range.start.getTime()) / DAY_IN_MS,
  );

  const useMonthlyBuckets =
    query.period === "this-year" ||
    (query.period === "custom" && durationDays > 62);

  if (useMonthlyBuckets) {
    const startMonth = rangeParts.month;
    const endMonth = endParts.month;
    const startYear = rangeParts.year;
    const endYear = endParts.year;

    let year = startYear;
    let month = startMonth;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      const date = lagosDateToUTC({
        year,
        month,
        day: 1,
      });

      buckets.push({
        key: `${year}-${String(month).padStart(2, "0")}`,
        label: formatChartDate(date, {
          month: "short",
        }),
      });

      month += 1;

      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    return buckets;
  }

  // Daily buckets for weekly, monthly and shorter custom reports.
  const finalDay = startOfLagosDay(addDays(range.end, -1));

  for (
    let date = startOfLagosDay(range.start);
    date <= finalDay;
    date = addDays(date, 1)
  ) {
    buckets.push({
      key: getDateKey(date),
      label: formatChartDate(date, {
        month: "short",
        day: "numeric",
      }),
    });
  }

  return buckets;
}

function getChartKey(date: Date, period: RevenuePeriod): string {
  if (period === "today") {
    const parts = getLagosDateParts(date);

    return `${getDateKey(date)}-${String(parts.hour ?? 0).padStart(2, "0")}`;
  }

  if (period === "this-year") {
    const parts = getLagosDateParts(date);

    return `${parts.year}-${String(parts.month).padStart(2, "0")}`;
  }

  return getDateKey(date);
}

function buildRevenueChart(
  orders: RevenueOrderRecord[],
  query: AdminRevenueQuery,
  range: DateRange,
) {
  const buckets = getChartBuckets(query, range);

  const chartMap = new Map<string, RevenueAccumulator>();

  for (const bucket of buckets) {
    chartMap.set(bucket.key, {
      revenue: 0,
      orders: 0,
    });
  }

  for (const order of orders) {
    const processed = calculateOrderRevenue(order);

    if (processed.fullyRefunded) {
      continue;
    }

    const key = getChartKey(order.reportDate, query.period);
    const bucket = chartMap.get(key);

    if (!bucket) continue;

    bucket.revenue += processed.netRevenue;
    bucket.orders += 1;
  }

  return buckets.map((bucket) => {
    const values = chartMap.get(bucket.key);

    return {
      label: bucket.label,
      revenue: roundMoney(values?.revenue ?? 0),
      orders: values?.orders ?? 0,
    };
  });
}

// ============================================
// CATEGORY PERFORMANCE
// ============================================

function buildCategoryReport(orders: RevenueOrderRecord[]) {
  const categoryMap = new Map<string, CategoryAccumulator>();

  for (const order of orders) {
    const processed = calculateOrderRevenue(order);

    if (processed.fullyRefunded) continue;

    const subtotal = Math.max(0, Number(order.subtotal ?? 0));

    for (const item of order.items ?? []) {
      const lineTotal = Math.max(0, Number(item.lineTotal ?? 0));

      const refundShare = allocateRefund(
        lineTotal,
        subtotal,
        processed.refundApplied,
      );

      const netLineRevenue = Math.max(0, lineTotal - refundShare);

      const categoryId = item.categoryId
        ? String(item.categoryId)
        : "uncategorized";

      const categoryName = item.categoryName?.trim() || "Uncategorized";

      const existing = categoryMap.get(categoryId);

      if (existing) {
        existing.revenue += netLineRevenue;
      } else {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          revenue: netLineRevenue,
        });
      }
    }
  }

  const categories = Array.from(categoryMap.values());

  const totalCategoryRevenue = categories.reduce(
    (total, category) => total + category.revenue,
    0,
  );

  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      revenue: roundMoney(category.revenue),
      percentage:
        totalCategoryRevenue > 0
          ? roundMoney((category.revenue / totalCategoryRevenue) * 100)
          : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ============================================
// TOP-SELLING PRODUCTS
// ============================================

function buildTopProducts(orders: RevenueOrderRecord[]) {
  const productMap = new Map<string, ProductAccumulator>();

  for (const order of orders) {
    const processed = calculateOrderRevenue(order);

    if (processed.fullyRefunded) continue;

    const subtotal = Math.max(0, Number(order.subtotal ?? 0));

    for (const item of order.items ?? []) {
      const productId = String(item.productId);

      const quantity = Math.max(0, Number(item.quantity ?? 0));
      const lineTotal = Math.max(0, Number(item.lineTotal ?? 0));

      const refundShare = allocateRefund(
        lineTotal,
        subtotal,
        processed.refundApplied,
      );

      const netLineRevenue = Math.max(0, lineTotal - refundShare);

      const variant = [item.brand, item.model].filter(Boolean).join(" ");

      const existing = productMap.get(productId);

      if (existing) {
        existing.unitsSold += quantity;
        existing.revenue += netLineRevenue;

        if (!existing.image && item.image) {
          existing.image = item.image;
        }
      } else {
        productMap.set(productId, {
          id: productId,
          name: item.name,
          image: item.image || "",
          variant,
          unitsSold: quantity,
          revenue: netLineRevenue,
        });
      }
    }
  }

  return Array.from(productMap.values())
    .map((product) => ({
      ...product,
      revenue: roundMoney(product.revenue),
    }))
    .sort((a, b) => {
      if (b.unitsSold !== a.unitsSold) {
        return b.unitsSold - a.unitsSold;
      }

      return b.revenue - a.revenue;
    })
    .slice(0, TOP_PRODUCT_LIMIT);
}

// ============================================
// RECENT ORDERS
// ============================================

function mapRevenueOrderStatus(
  order: RevenueOrderRecord,
): "processing" | "dispatched" | "in-transit" | "delivered" | "cancelled" {
  const status = order.fulfilmentStatus;

  if (status === "cancelled" || order.status === "cancelled") {
    return "cancelled";
  }

  if (status === "delivered" || order.status === "fulfilled") {
    return "delivered";
  }

  if (status === "in_transit") {
    return "in-transit";
  }

  if (status === "dispatched") {
    return "dispatched";
  }

  return "processing";
}

function buildRecentOrders(orders: RevenueOrderRecord[]) {
  return orders
    .map((order) => {
      const processed = calculateOrderRevenue(order);

      const payment = order.canonicalPayment;

      const refundAmount =
        payment.refundStatus === "success"
          ? Number(payment.refundAmount ?? 0) / 100
          : 0;

      const customerName = order.customerRecord?.deletedAt
        ? "Deleted Customer"
        : order.customerRecord?.fullName ||
          order.deliveryAddress?.fullName ||
          "Unknown Customer";

      return {
        id: String(order._id),
        orderNumber: order.orderNumber,
        customerName,
        // The recent orders table shows the net customer payment,
        // including delivery, unlike merchandise revenue KPIs.
        total: roundMoney(Math.max(0, Number(order.total ?? 0) - refundAmount)),
        status: mapRevenueOrderStatus(order),
        orderedAt: order.reportDate.toISOString(),
        fullyRefunded: processed.fullyRefunded,
      };
    })
    .filter((order) => !order.fullyRefunded)
    .sort(
      (a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
    )
    .slice(0, RECENT_ORDER_LIMIT)
    .map(({ fullyRefunded: _fullyRefunded, ...order }) => order);
}

// ============================================
// MAIN REVENUE REPORT SERVICE
// ============================================

export async function getAdminRevenueReport(query: AdminRevenueQuery) {
  const range = getDateRange(query);

  // Load current and comparison periods independently.
  // This keeps the aggregation easy to reason about and ensures
  // the two reporting windows never overlap.
  const [currentOrders, previousOrders] = await Promise.all([
    OrderModel.aggregate<RevenueOrderRecord>(
      getRevenueOrderPipeline(range.start, range.end),
    ),

    OrderModel.aggregate<RevenueOrderRecord>(
      getRevenueOrderPipeline(range.previousStart, range.previousEnd),
    ),
  ]);

  const currentMetrics = calculateMetrics(currentOrders);
  const previousMetrics = calculateMetrics(previousOrders);

  return {
    summary: {
      totalRevenue: createMetric(
        currentMetrics.revenue,
        previousMetrics.revenue,
      ),

      totalOrders: createMetric(currentMetrics.orders, previousMetrics.orders),

      unitsSold: createMetric(currentMetrics.units, previousMetrics.units),

      averageOrderValue: createMetric(
        currentMetrics.averageOrderValue,
        previousMetrics.averageOrderValue,
      ),
    },

    chart: buildRevenueChart(currentOrders, query, range),

    categories: buildCategoryReport(currentOrders),

    topProducts: buildTopProducts(currentOrders),

    recentOrders: buildRecentOrders(currentOrders),
  };
}
