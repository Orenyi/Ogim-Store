import mongoose, { Types } from "mongoose";

import OrderModel from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// ============================================
// TYPES
// ============================================

export const ORDER_FULFILMENT_STATUSES = [
  "pending_dispatch",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export type AdminFulfilmentStatus = (typeof ORDER_FULFILMENT_STATUSES)[number];

export type AdminPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface AdminOrdersQuery {
  page: number;
  limit: number;
  search?: string;
  fulfilmentStatus?: AdminFulfilmentStatus | "all";
  paymentStatus?: AdminPaymentStatus | "all";
  startDate?: string;
  endDate?: string;
}

export interface UpdateAdminOrderStatusInput {
  status: AdminFulfilmentStatus;
  note?: string;
}

interface FulfilmentEvent {
  status: AdminFulfilmentStatus;
  note?: string;
  adminId: Types.ObjectId | null;
  createdAt: Date;
}

interface OrderDocument {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    slug: string;
    brand: string;
    model: string;
    condition: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    address: string;
    instructions?: string;
  };
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paidPaymentId?: Types.ObjectId | null;
  paymentReference?: string | null;
  fulfilmentStatus?: AdminFulfilmentStatus;
  fulfilmentEvents?: FulfilmentEvent[];
  reservationExpiresAt: Date;
  stockRestoredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerRecord {
  _id: Types.ObjectId;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  deletedAt?: Date | null;
}

interface PaymentRecord {
  _id: Types.ObjectId;
  reference: string;
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  channel?: string;
  failureReason?: string;
  paidAt?: Date | null;
  verifiedAt?: Date | null;
  refundStatus?: string;
  refundAmount?: number;
  refundCurrency?: string;
  refundReason?: string;
  refundFailureReason?: string;
  refundProviderId?: string;
  refundRequestedAt?: Date | null;
  refundProcessedAt?: Date | null;
  refundUpdatedAt?: Date | null;
  refundAttemptCount?: number;
}

interface AggregatedOrder extends OrderDocument {
  customerRecord?: CustomerRecord | null;
  paymentRecord?: PaymentRecord | null;
}

// ============================================
// ERRORS
// ============================================

export class AdminOrderServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminOrderServiceError";
    this.statusCode = statusCode;
  }
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const FULFILMENT_FLOW: AdminFulfilmentStatus[] = [
  "pending_dispatch",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
];

const FULFILMENT_LABELS: Record<AdminFulfilmentStatus, string> = {
  pending_dispatch: "Pending Dispatch",
  processing: "Processing",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ============================================
// VALIDATION AND NORMALIZATION
// ============================================

function normalizePagination(page: number, limit: number) {
  const safePage = Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;

  const safeLimit =
    Number.isInteger(limit) && limit > 0
      ? Math.min(limit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

function getValidDate(
  value: string | undefined,
  fieldName: string,
): Date | undefined {
  if (!value?.trim()) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AdminOrderServiceError(`Invalid ${fieldName} date.`, 400);
  }

  return date;
}

function getLegacyFulfilmentStatus(
  order: Pick<OrderDocument, "status" | "paymentStatus">,
): AdminFulfilmentStatus {
  switch (order.status) {
    case "fulfilled":
      return "delivered";

    case "cancelled":
    case "expired":
      return "cancelled";

    case "confirmed":
      return order.paymentStatus === "paid" ? "pending_dispatch" : "cancelled";

    case "pending":
    default:
      return "cancelled";
  }
}

function getFulfilmentStatus(
  order: Pick<OrderDocument, "status" | "paymentStatus" | "fulfilmentStatus">,
): AdminFulfilmentStatus {
  if (
    order.fulfilmentStatus &&
    ORDER_FULFILMENT_STATUSES.includes(order.fulfilmentStatus)
  ) {
    return order.fulfilmentStatus;
  }

  return getLegacyFulfilmentStatus(order);
}

function getPaymentStatus(
  order: Pick<OrderDocument, "paymentStatus">,
  payment?: PaymentRecord | null,
): AdminPaymentStatus {
  if (!payment) {
    // Preserve the order-level payment status for legacy records
    // that do not have a linked canonical payment.
    return order.paymentStatus === "paid" ? "paid" : "pending";
  }

  if (payment.status === "success") {
    const refundAmount = Number(payment.refundAmount ?? 0);
    const paymentAmount = Number(payment.amount);

    if (payment.refundStatus === "success" && refundAmount >= paymentAmount) {
      return "refunded";
    }

    if (
      payment.refundStatus === "success" &&
      refundAmount > 0 &&
      refundAmount < paymentAmount
    ) {
      return "partially_refunded";
    }

    return "paid";
  }

  if (
    payment.status === "failed" ||
    payment.status === "abandoned" ||
    payment.status === "expired"
  ) {
    return "failed";
  }

  return "pending";
}

function getCustomerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function mapProductCondition(
  condition: string,
): "brand_new" | "uk_used" | "refurbished" {
  switch (condition) {
    case "brand-new":
      return "brand_new";

    case "uk-used":
      return "uk_used";

    case "refurbished":
      return "refurbished";

    default:
      return "brand_new";
  }
}

function formatDeliveryMethod(method: string): string {
  switch (method) {
    case "standard":
      return "Standard Delivery";

    case "express":
      return "Express Delivery";

    case "same-day":
      return "Same-day Delivery";

    default:
      return method;
  }
}

function getPaymentMethod(
  payment?: PaymentRecord | null,
): "paystack" | "bank_transfer" | "cash_on_delivery" {
  if (payment?.gateway === "paystack") {
    return "paystack";
  }

  // The current backend only supports Paystack.
  return "paystack";
}

function toISOStringOrNull(value?: Date | string | null): string | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ============================================
// AGGREGATION HELPERS
// ============================================

function getOrderLookupPipeline() {
  return [
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
        as: "paymentRecord",
      },
    },
    {
      $unwind: {
        path: "$paymentRecord",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
}

function getPaymentFilter(status: AdminPaymentStatus): Record<string, unknown> {
  switch (status) {
    case "paid":
      return {
        "paymentRecord.status": "success",
        $or: [
          { "paymentRecord.refundStatus": { $ne: "success" } },
          {
            $expr: {
              $lt: [
                { $ifNull: ["$paymentRecord.refundAmount", 0] },
                "$paymentRecord.amount",
              ],
            },
          },
        ],
      };

    case "refunded":
      return {
        "paymentRecord.status": "success",
        "paymentRecord.refundStatus": "success",
        $expr: {
          $gte: ["$paymentRecord.refundAmount", "$paymentRecord.amount"],
        },
      };

    case "partially_refunded":
      return {
        "paymentRecord.status": "success",
        "paymentRecord.refundStatus": "success",
        $expr: {
          $and: [
            {
              $gt: ["$paymentRecord.refundAmount", 0],
            },
            {
              $lt: ["$paymentRecord.refundAmount", "$paymentRecord.amount"],
            },
          ],
        },
      };

    case "failed":
      return {
        "paymentRecord.status": {
          $in: ["failed", "abandoned", "expired"],
        },
      };

    case "pending":
    default:
      return {
        $or: [
          { paymentRecord: null },
          {
            "paymentRecord.status": {
              $in: ["initializing", "pending"],
            },
          },
        ],
      };
  }
}

function getSearchMatch(search: string): Record<string, unknown> | null {
  const normalized = search.trim();

  if (!normalized) return null;

  const regex = new RegExp(escapeRegex(normalized), "i");

  return {
    $or: [
      { orderNumber: regex },
      { "customerRecord.fullName": regex },
      { "customerRecord.email": regex },
      { "customerRecord.phoneNumber": regex },
      { "items.name": regex },
      { paymentReference: regex },
      { "paymentRecord.reference": regex },
    ],
  };
}

// ============================================
// TIMELINE
// ============================================

function buildTimeline(order: AggregatedOrder) {
  const currentStatus = getFulfilmentStatus(order);
  const payment = order.paymentRecord;

  const timeline: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string | null;
    status: "completed" | "current" | "upcoming";
  }> = [];

  timeline.push({
    id: "placed",
    title: "Order Placed",
    description: "Customer placed the order.",
    timestamp: toISOStringOrNull(order.createdAt),
    status: "completed",
  });

  if (payment?.status === "success") {
    timeline.push({
      id: "payment",
      title: "Payment Verified",
      description: "Payment was successfully verified.",
      timestamp:
        toISOStringOrNull(payment.paidAt) ??
        toISOStringOrNull(payment.verifiedAt),
      status: "completed",
    });
  }

  const events = [...(order.fulfilmentEvents ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Find the latest recorded event matching the actual order status.
  // Earlier occurrences remain completed history.
  let currentEventIndex = -1;

  for (let index = events.length - 1; index >= 0; index -= 1) {
    if (events[index].status === currentStatus) {
      currentEventIndex = index;
      break;
    }
  }

  events.forEach((event, index) => {
    const timestamp = toISOStringOrNull(event.createdAt);

    timeline.push({
      id: `fulfilment-${index}-${timestamp ?? "unknown"}`,
      title: FULFILMENT_LABELS[event.status],
      description: event.note || FULFILMENT_LABELS[event.status],
      timestamp,
      status: index === currentEventIndex ? "current" : "completed",
    });
  });

  // Older orders may have a fulfilmentStatus without a corresponding
  // event. Show the real current status without inventing a timestamp.
  if (currentEventIndex === -1) {
    timeline.push({
      id: `current-${currentStatus}`,
      title: FULFILMENT_LABELS[currentStatus],
      description: FULFILMENT_LABELS[currentStatus],
      timestamp: null,
      status: "current",
    });
  }

  if (currentStatus === "cancelled") {
    return timeline;
  }

  const flowIndex = FULFILMENT_FLOW.indexOf(currentStatus);

  for (let index = flowIndex + 1; index < FULFILMENT_FLOW.length; index += 1) {
    const status = FULFILMENT_FLOW[index];

    timeline.push({
      id: `upcoming-${status}`,
      title: FULFILMENT_LABELS[status],
      description: `Order is awaiting ${FULFILMENT_LABELS[
        status
      ].toLowerCase()}.`,
      timestamp: null,
      status: "upcoming",
    });
  }

  return timeline;
}

// ============================================
// SERIALIZE ADMIN ORDER
// ============================================

function serializeAdminOrder(order: AggregatedOrder) {
  const customer = order.customerRecord;

  const customerName = customer?.deletedAt
    ? "Deleted Customer"
    : customer?.fullName ||
      order.deliveryAddress?.fullName ||
      "Unknown Customer";

  const customerEmail = customer?.deletedAt
    ? ""
    : customer?.email || order.deliveryAddress?.email || "";

  const customerPhone = customer?.deletedAt
    ? ""
    : customer?.phoneNumber || order.deliveryAddress?.phone || "";

  const items = (order.items ?? []).map((item) => ({
    productId: String(item.productId),
    productName: item.name,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    condition: mapProductCondition(item.condition),
    image: item.image || "",
    variant: [item.brand, item.model].filter(Boolean).join(" "),
  }));

  const payment = order.paymentRecord;
  const paymentStatus = getPaymentStatus(order, payment);
  const fulfilmentStatus = getFulfilmentStatus(order);

  const deliveryAddress = order.deliveryAddress
    ? {
        recipient: order.deliveryAddress.fullName,
        phoneNumber: order.deliveryAddress.phone,
        addressLine: order.deliveryAddress.address,
        city: order.deliveryAddress.city,
        state: order.deliveryAddress.state,
        country: "Nigeria",
        instructions: order.deliveryAddress.instructions || "",
      }
    : undefined;

  const paymentDate =
    toISOStringOrNull(payment?.paidAt) ??
    toISOStringOrNull(payment?.verifiedAt);

  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,

    customer: {
      id: order.userId?.toString() ?? "",
      fullName: customerName,
      email: customerEmail,
      phoneNumber: customerPhone,
      initials: getCustomerInitials(customerName),
    },

    items,

    itemSummary:
      items.length === 0
        ? "No items"
        : items.length === 1
          ? items[0].productName
          : `${items[0].productName} and ${items.length - 1} other item(s)`,

    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),

    paymentStatus,
    paymentMethod: getPaymentMethod(payment),
    paymentReference: payment?.reference || order.paymentReference || undefined,
    paymentDate: paymentDate ?? undefined,

    // Canonical payment information.
    // Payment and refund amounts are stored in kobo by the Payment model.
    paymentDetails: payment
      ? {
          id: payment._id.toString(),
          gateway: payment.gateway,
          channel: payment.channel || "",
          status: payment.status,
          amountKobo: Number(payment.amount),
          currency: payment.currency,
          failureReason: payment.failureReason || "",
          paidAt: toISOStringOrNull(payment.paidAt),
          verifiedAt: toISOStringOrNull(payment.verifiedAt),

          refund: {
            status: payment.refundStatus || "not_required",
            amountKobo: Number(payment.refundAmount ?? 0),
            currency: payment.refundCurrency || payment.currency,
            reason: payment.refundReason || "",
            failureReason: payment.refundFailureReason || "",
            providerId: payment.refundProviderId || "",
            requestedAt: toISOStringOrNull(payment.refundRequestedAt),
            processedAt: toISOStringOrNull(payment.refundProcessedAt),
            updatedAt: toISOStringOrNull(payment.refundUpdatedAt),
            attemptCount: Number(payment.refundAttemptCount ?? 0),
          },
        }
      : null,

    fulfilmentStatus,

    deliveryAddress,

    delivery: {
      method: formatDeliveryMethod(order.deliveryMethod),
      fee: Number(order.deliveryFee),
    },

    timeline: buildTimeline(order),

    orderedAt: toISOStringOrNull(order.createdAt),
    updatedAt: toISOStringOrNull(order.updatedAt),
  };
}

// ============================================
// GET ORDER SUMMARY
// ============================================

export async function getAdminOrdersSummary() {
  const [totalOrders, fulfilmentCounts, unitsSoldResult] = await Promise.all([
    OrderModel.countDocuments(),

    OrderModel.aggregate([
      {
        $addFields: {
          effectiveFulfilmentStatus: {
            $ifNull: [
              "$fulfilmentStatus",
              {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$status", "fulfilled"] },
                      then: "delivered",
                    },
                    {
                      case: {
                        $in: ["$status", ["cancelled", "expired"]],
                      },
                      then: "cancelled",
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ["$status", "confirmed"] },
                          { $eq: ["$paymentStatus", "paid"] },
                        ],
                      },
                      then: "pending_dispatch",
                    },
                  ],
                  // Unpaid and otherwise unassigned orders must not be
                  // counted as awaiting dispatch.
                  default: "unassigned",
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$effectiveFulfilmentStatus",
          count: { $sum: 1 },
        },
      },
    ]),

    // Units sold: paid, non-cancelled orders with a canonical
    // successful payment. Fully refunded payments are excluded.
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          paidPaymentId: { $ne: null },
          status: { $in: ["confirmed", "fulfilled"] },
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
          $or: [
            {
              "canonicalPayment.refundStatus": {
                $ne: "success",
              },
            },
            {
              $expr: {
                $lt: [
                  {
                    $ifNull: ["$canonicalPayment.refundAmount", 0],
                  },
                  "$canonicalPayment.amount",
                ],
              },
            },
          ],
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          unitsSold: { $sum: "$items.quantity" },
        },
      },
    ]),
  ]);

  const counts: Record<string, number> = {};

  for (const item of fulfilmentCounts) {
    counts[item._id] = item.count;
  }

  return {
    allOrders: totalOrders,
    processing: counts.processing ?? 0,
    inTransit: counts.in_transit ?? 0,
    delivered: counts.delivered ?? 0,
    pendingDispatch: counts.pending_dispatch ?? 0,
    unitsSold: unitsSoldResult[0]?.unitsSold ?? 0,
  };
}

// ============================================
// GET ADMIN ORDERS
// ============================================

export async function getAdminOrders(query: AdminOrdersQuery) {
  const { page, limit, skip } = normalizePagination(query.page, query.limit);

  const startDate = getValidDate(query.startDate, "start");
  const endDate = getValidDate(query.endDate, "end");

  if (startDate && endDate && startDate > endDate) {
    throw new AdminOrderServiceError(
      "The start date cannot be later than the end date.",
      400,
    );
  }

  const match: Record<string, unknown> = {};

  if (query.fulfilmentStatus && query.fulfilmentStatus !== "all") {
    switch (query.fulfilmentStatus) {
      case "pending_dispatch":
        match.$or = [
          { fulfilmentStatus: "pending_dispatch" },
          {
            fulfilmentStatus: { $exists: false },
            status: "confirmed",
            paymentStatus: "paid",
          },
        ];
        break;

      case "delivered":
        match.$or = [
          { fulfilmentStatus: "delivered" },
          {
            fulfilmentStatus: { $exists: false },
            status: "fulfilled",
          },
        ];
        break;

      case "cancelled":
        match.$or = [
          { fulfilmentStatus: "cancelled" },
          {
            fulfilmentStatus: { $exists: false },
            status: { $in: ["cancelled", "expired"] },
          },
        ];
        break;

      default:
        match.fulfilmentStatus = query.fulfilmentStatus;
        break;
    }
  }

  if (startDate || endDate) {
    const createdAt: Record<string, Date> = {};

    if (startDate) {
      createdAt.$gte = startDate;
    }

    if (endDate) {
      createdAt.$lte = endDate;
    }

    match.createdAt = createdAt;
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
    ...getOrderLookupPipeline(),
  ];

  const searchMatch = getSearchMatch(query.search ?? "");

  if (searchMatch) {
    pipeline.push({
      $match: searchMatch,
    } as mongoose.PipelineStage);
  }

  if (query.paymentStatus && query.paymentStatus !== "all") {
    pipeline.push({
      $match: getPaymentFilter(query.paymentStatus),
    } as mongoose.PipelineStage);
  }

  pipeline.push({
    $facet: {
      orders: [
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await OrderModel.aggregate(pipeline);

  const orders = (result?.orders ?? []).map((order: AggregatedOrder) =>
    serializeAdminOrder(order),
  );

  const total = result?.total?.[0]?.count ?? 0;
  const summary = await getAdminOrdersSummary();

  return {
    orders,
    summary,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// ============================================
// GET ADMIN ORDER DETAILS
// ============================================

export async function getAdminOrderById(orderId: string) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new AdminOrderServiceError("Invalid order ID.", 400);
  }

  const [order] = await OrderModel.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(orderId),
      },
    },
    ...getOrderLookupPipeline(),
    { $limit: 1 },
  ]);

  if (!order) {
    throw new AdminOrderServiceError("Order not found.", 404);
  }

  return serializeAdminOrder(order as AggregatedOrder);
}

// ============================================
// UPDATE FULFILMENT STATUS
// ============================================

function validateFulfilmentTransition(
  currentStatus: AdminFulfilmentStatus,
  nextStatus: AdminFulfilmentStatus,
): void {
  if (currentStatus === nextStatus) {
    throw new AdminOrderServiceError(
      "The order already has this fulfilment status.",
      409,
    );
  }

  if (currentStatus === "delivered" || currentStatus === "cancelled") {
    throw new AdminOrderServiceError(
      "This order has reached a final fulfilment status.",
      409,
    );
  }

  if (nextStatus === "cancelled") {
    return;
  }

  const currentIndex = FULFILMENT_FLOW.indexOf(currentStatus);
  const nextIndex = FULFILMENT_FLOW.indexOf(nextStatus);

  if (nextIndex !== currentIndex + 1) {
    throw new AdminOrderServiceError(
      `Invalid fulfilment transition from ${currentStatus} to ${nextStatus}.`,
      409,
    );
  }
}

export async function updateAdminOrderStatus(
  orderId: string,
  adminId: string,
  input: UpdateAdminOrderStatusInput,
) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new AdminOrderServiceError("Invalid order ID.", 400);
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw new AdminOrderServiceError(
      "A valid authenticated admin is required.",
      401,
    );
  }

  if (!ORDER_FULFILMENT_STATUSES.includes(input.status)) {
    throw new AdminOrderServiceError("Invalid fulfilment status.", 400);
  }

  const note = input.note?.trim();

  if (note && note.length > 500) {
    throw new AdminOrderServiceError(
      "The fulfilment note cannot exceed 500 characters.",
      400,
    );
  }

  const order = await OrderModel.findById(orderId).lean<OrderDocument>();

  if (!order) {
    throw new AdminOrderServiceError("Order not found.", 404);
  }

  const currentStatus = getFulfilmentStatus(order);

  validateFulfilmentTransition(currentStatus, input.status);

  // Dispatch must never proceed without a verified canonical payment.
  if (input.status !== "cancelled" && order.paymentStatus !== "paid") {
    throw new AdminOrderServiceError(
      "This order cannot progress through fulfilment until its payment is verified.",
      409,
    );
  }

  if (
    input.status !== "cancelled" &&
    (!order.paidPaymentId || !order.paymentReference)
  ) {
    throw new AdminOrderServiceError(
      "This order does not have a canonical successful payment.",
      409,
    );
  }

  const payment = order.paidPaymentId
    ? await Payment.findById(order.paidPaymentId)
        .select("status refundStatus refundAmount amount")
        .lean()
    : null;

  if (input.status !== "cancelled" && payment?.status !== "success") {
    throw new AdminOrderServiceError(
      "The linked payment has not been successfully verified.",
      409,
    );
  }

  if (
    input.status !== "cancelled" &&
    payment?.refundStatus === "success" &&
    Number(payment.refundAmount ?? 0) >= Number(payment.amount)
  ) {
    throw new AdminOrderServiceError(
      "A fully refunded order cannot progress through fulfilment.",
      409,
    );
  }

  const now = new Date();

  const event: FulfilmentEvent = {
    status: input.status,
    note: note || FULFILMENT_LABELS[input.status],
    adminId: new Types.ObjectId(adminId),
    createdAt: now,
  };

  const update: mongoose.UpdateQuery<unknown> = {
    $set: {
      fulfilmentStatus: input.status,
      ...(input.status === "delivered" ? { status: "fulfilled" } : {}),
    },
    $push: {
      fulfilmentEvents: event,
    },
  };

  // Compare-and-set prevents concurrent admins from overwriting
  // each other's fulfilment transitions.
  const updateResult = await OrderModel.updateOne(
    {
      _id: new Types.ObjectId(orderId),
      fulfilmentStatus: order.fulfilmentStatus ?? {
        $exists: false,
      },
    },
    update as mongoose.UpdateQuery<typeof OrderModel>,
  );

  if (updateResult.modifiedCount !== 1) {
    throw new AdminOrderServiceError(
      "This order was updated by another administrator. Refresh and try again.",
      409,
    );
  }

  return getAdminOrderById(orderId);
}
