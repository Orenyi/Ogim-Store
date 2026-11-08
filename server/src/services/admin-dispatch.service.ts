import mongoose, { Types } from "mongoose";

import DispatchModel, {
  DISPATCH_STATUSES,
  type DispatchStatus,
  type DeliveryPartner,
} from "../models/Dispatch.js";

import OrderModel from "../models/Order.js";
import Payment from "../models/Payment.js";

// ============================================
// TYPES
// ============================================

export interface AssignDispatchInput {
  orderId: string;
  deliveryPartner: DeliveryPartner;
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface AdminDispatchQuery {
  search: string;
  status: DispatchStatus | "all";
  partner: DeliveryPartner | "all";
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export interface AdminEligibleDispatchOrder {
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

export interface AdminDispatch {
  id: string;
  orderId: string;
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

  deliveryPartner: DeliveryPartner | null;
  trackingNumber: string | null;

  status: DispatchStatus;

  dispatchedAt: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface AdminDispatchSummary {
  pending: number;
  dispatched: number;
  inTransit: number;
  delivered: number;
  total: number;
}

export interface AdminDispatchResponse {
  dispatches: AdminDispatch[];
  summary: AdminDispatchSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AdminDispatchError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminDispatchError";
    this.statusCode = statusCode;
  }
}

// ============================================
// STATUS TRANSITIONS
// ============================================

const ALLOWED_TRANSITIONS: Record<DispatchStatus, DispatchStatus[]> = {
  pending: ["dispatched"],
  dispatched: ["in_transit"],
  in_transit: ["delivered"],
  delivered: [],
};

// ============================================
// HELPERS
// ============================================

function toISO(value: Date | string | null | undefined): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDateRange(startDate: string, endDate: string) {
  const range: {
    $gte?: Date;
    $lte?: Date;
  } = {};

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);

    if (Number.isNaN(start.getTime())) {
      throw new AdminDispatchError("Invalid start date.");
    }

    range.$gte = start;
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999Z`);

    if (Number.isNaN(end.getTime())) {
      throw new AdminDispatchError("Invalid end date.");
    }

    range.$lte = end;
  }

  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    throw new AdminDispatchError("Start date cannot be after end date.");
  }

  return Object.keys(range).length ? range : null;
}

function getOrderProductSummary(items: any[]): string {
  if (items.length === 0) return "No products";

  return items.length === 1
    ? items[0].name
    : `${items[0].name} + ${items.length - 1} more`;
}

function getOrderItemCount(items: any[]): number {
  return items.reduce(
    (total: number, item: { quantity?: number }) =>
      total + (Number(item.quantity) || 0),
    0,
  );
}

function mapEligibleOrder(order: any): AdminEligibleDispatchOrder {
  const customer = order.deliveryAddress;
  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,

    customer: {
      id: order.userId.toString(),
      fullName: customer?.fullName ?? "",
      phoneNumber: customer?.phone ?? "",
      email: customer?.email ?? "",
    },

    destination: {
      addressLine: customer?.address ?? "",
      city: customer?.city ?? "",
      state: customer?.state ?? "",
      country: "Nigeria",
    },

    productSummary: getOrderProductSummary(items),
    itemCount: getOrderItemCount(items),
    total: Number(order.total) || 0,
    createdAt: toISO(order.createdAt) ?? "",
  };
}

function mapDispatch(record: any): AdminDispatch {
  const order = record.orderId;

  if (!order || typeof order !== "object") {
    throw new AdminDispatchError(
      `Order details are missing for dispatch ${record._id}.`,
      500,
    );
  }

  const customer = order.deliveryAddress;
  const items = Array.isArray(order.items) ? order.items : [];

  return {
    id: record._id.toString(),
    orderId: order._id.toString(),
    orderNumber: record.orderNumber,

    customer: {
      id: order.userId.toString(),
      fullName: customer?.fullName ?? "",
      phoneNumber: customer?.phone ?? "",
      email: customer?.email ?? "",
    },

    destination: {
      addressLine: customer?.address ?? "",
      city: customer?.city ?? "",
      state: customer?.state ?? "",
      country: "Nigeria",
    },

    productSummary: getOrderProductSummary(items),
    itemCount: getOrderItemCount(items),
    total: Number(order.total) || 0,

    deliveryPartner: record.deliveryPartner ?? null,
    trackingNumber: record.trackingNumber ?? null,

    status: record.status,

    dispatchedAt: toISO(record.dispatchedAt),
    estimatedDelivery: toISO(record.estimatedDelivery),
    deliveredAt: toISO(record.deliveredAt),

    createdAt: toISO(record.createdAt) ?? "",
    updatedAt: toISO(record.updatedAt) ?? "",
  };
}

function getEmptySummary(): AdminDispatchSummary {
  return {
    pending: 0,
    dispatched: 0,
    inTransit: 0,
    delivered: 0,
    total: 0,
  };
}

// ============================================
// GET ELIGIBLE ORDERS FOR DISPATCH
// ============================================

export async function getAdminEligibleDispatchOrders(
  search = "",
): Promise<AdminEligibleDispatchOrder[]> {
  const filter: Record<string, any> = {
    paymentStatus: "paid",
    paidPaymentId: { $ne: null },
    fulfilmentStatus: "pending_dispatch",
    status: { $nin: ["cancelled", "expired"] },
  };

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { orderNumber: searchRegex },
      { "deliveryAddress.fullName": searchRegex },
      { "deliveryAddress.phone": searchRegex },
      { "deliveryAddress.email": searchRegex },
      { "deliveryAddress.city": searchRegex },
      { "deliveryAddress.state": searchRegex },
    ];
  }

  // Find orders that have not already been assigned.
  const assignedOrderIds = await DispatchModel.distinct("orderId");

  if (assignedOrderIds.length > 0) {
    filter._id = { $nin: assignedOrderIds };
  }

  const orders = await OrderModel.find(filter)
    .select(
      "_id userId orderNumber deliveryAddress items total createdAt paidPaymentId",
    )
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  if (orders.length === 0) {
    return [];
  }

  // Retrieve successful payments linked to these orders.
  const paymentIds = orders
    .map((order) => order.paidPaymentId)
    .filter((id): id is Types.ObjectId => Boolean(id));

  const payments = await Payment.find({
    _id: { $in: paymentIds },
    status: "success",
    refundStatus: "not_required",
  })
    .select("_id orderId userId")
    .lean();

  const validPaymentIds = new Set(
    payments
      .filter((payment: any) => {
        const order = orders.find(
          (item) => item._id.toString() === payment.orderId.toString(),
        );

        return (
          order &&
          order.userId.toString() === payment.userId.toString() &&
          order.paidPaymentId.toString() === payment._id.toString()
        );
      })
      .map((payment: any) => payment._id.toString()),
  );

  return orders
    .filter(
      (order) =>
        order.paidPaymentId &&
        validPaymentIds.has(order.paidPaymentId.toString()),
    )
    .map(mapEligibleOrder);
}

// ============================================
// GET DISPATCHES
// ============================================

export async function getAdminDispatches(
  query: AdminDispatchQuery,
): Promise<AdminDispatchResponse> {
  const page = Math.max(1, Math.floor(query.page || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit || 5)));

  const filter: Record<string, any> = {};

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.partner && query.partner !== "all") {
    filter.deliveryPartner = query.partner;
  }

  const dateRange = getDateRange(query.startDate, query.endDate);

  if (dateRange) {
    filter.createdAt = dateRange;
  }

  if (query.search.trim()) {
    const search = new RegExp(escapeRegex(query.search.trim()), "i");

    const matchingOrders = await OrderModel.find({
      $or: [
        { orderNumber: search },
        { "deliveryAddress.fullName": search },
        { "deliveryAddress.phone": search },
        { "deliveryAddress.city": search },
        { "deliveryAddress.state": search },
      ],
    })
      .select("_id")
      .lean();

    const matchingOrderIds = matchingOrders.map((order) => order._id);

    filter.$or = [
      { orderNumber: search },
      { trackingNumber: search },
      { orderId: { $in: matchingOrderIds } },
    ];
  }

  const [total, records, pending, dispatched, inTransit, delivered] =
    await Promise.all([
      DispatchModel.countDocuments(filter),

      DispatchModel.find(filter)
        .populate({
          path: "orderId",
          select: "userId items deliveryAddress total orderNumber",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      DispatchModel.countDocuments({ status: "pending" }),
      DispatchModel.countDocuments({ status: "dispatched" }),
      DispatchModel.countDocuments({ status: "in_transit" }),
      DispatchModel.countDocuments({ status: "delivered" }),
    ]);

  const summary: AdminDispatchSummary = {
    pending,
    dispatched,
    inTransit,
    delivered,
    total: pending + dispatched + inTransit + delivered,
  };

  return {
    dispatches: records.map(mapDispatch),
    summary: summary ?? getEmptySummary(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// ============================================
// ASSIGN DISPATCH
// ============================================

export async function assignAdminDispatch(
  input: AssignDispatchInput,
  adminId: string,
): Promise<AdminDispatch> {
  if (!Types.ObjectId.isValid(input.orderId)) {
    throw new AdminDispatchError("Invalid order ID.");
  }

  if (!Types.ObjectId.isValid(adminId)) {
    throw new AdminDispatchError("Invalid administrator ID.");
  }

  const orderId = new Types.ObjectId(input.orderId);
  const adminObjectId = new Types.ObjectId(adminId);

  const trackingNumber = input.trackingNumber.trim().toUpperCase();

  if (!trackingNumber) {
    throw new AdminDispatchError("Tracking number is required.");
  }

  if (trackingNumber.length > 100) {
    throw new AdminDispatchError(
      "Tracking number cannot exceed 100 characters.",
    );
  }

  if (!input.estimatedDelivery) {
    throw new AdminDispatchError("Estimated delivery date is required.");
  }

  const estimatedDelivery = new Date(input.estimatedDelivery);

  if (Number.isNaN(estimatedDelivery.getTime())) {
    throw new AdminDispatchError("Invalid estimated delivery date.");
  }

  if (estimatedDelivery <= new Date()) {
    throw new AdminDispatchError("Estimated delivery must be in the future.");
  }

  if (
    !["GIGL Logistics", "Sendbox", "Ogim Delivery", "DHL", "Other"].includes(
      input.deliveryPartner,
    )
  ) {
    throw new AdminDispatchError("Invalid delivery partner.");
  }

  const session = await mongoose.startSession();

  try {
    let result: AdminDispatch | null = null;

    await session.withTransaction(async () => {
      const order = await OrderModel.findById(orderId).session(session);

      if (!order) {
        throw new AdminDispatchError(
          "The selected order could not be found.",
          404,
        );
      }

      if (order.paymentStatus !== "paid" || !order.paidPaymentId) {
        throw new AdminDispatchError(
          "Only successfully paid orders can be assigned for dispatch.",
          409,
        );
      }

      const payment = await Payment.findOne({
        _id: order.paidPaymentId,
        orderId: order._id,
        userId: order.userId,
        status: "success",
        refundStatus: "not_required",
      }).session(session);

      if (!payment) {
        throw new AdminDispatchError(
          "A verified successful payment without an active refund could not be found for this order.",
          409,
        );
      }

      if (order.status === "cancelled" || order.status === "expired") {
        throw new AdminDispatchError(
          "Cancelled or expired orders cannot be dispatched.",
          409,
        );
      }

      if (order.fulfilmentStatus !== "pending_dispatch") {
        throw new AdminDispatchError(
          "This order is not ready for dispatch.",
          409,
        );
      }

      const existingDispatch = await DispatchModel.findOne({
        orderId: order._id,
      }).session(session);

      if (existingDispatch) {
        throw new AdminDispatchError(
          "This order already has a dispatch record.",
          409,
        );
      }

      const existingTracking = await DispatchModel.exists({
        trackingNumber,
      }).session(session);

      if (existingTracking) {
        throw new AdminDispatchError(
          "This tracking number is already in use.",
          409,
        );
      }

      const [dispatch] = await DispatchModel.create(
        [
          {
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: order.userId,

            deliveryPartner: input.deliveryPartner,
            trackingNumber,
            estimatedDelivery,

            status: "dispatched",
            dispatchedAt: new Date(),

            assignedBy: adminObjectId,

            statusHistory: [
              {
                previousStatus: null,
                status: "dispatched",
                note: "Dispatch assigned to delivery partner.",
                adminId: adminObjectId,
              },
            ],
          },
        ],
        { session },
      );

      order.fulfilmentStatus = "dispatched";

      order.fulfilmentEvents.push({
        status: "dispatched",
        note: `Assigned to ${input.deliveryPartner}. Tracking number: ${trackingNumber}.`,
        adminId: adminObjectId,
        createdAt: new Date(),
      } as any);

      await order.save({ session });

      const populatedDispatch = await DispatchModel.findById(dispatch._id)
        .populate({
          path: "orderId",
          select: "userId items deliveryAddress total orderNumber",
        })
        .session(session)
        .lean();

      if (!populatedDispatch) {
        throw new AdminDispatchError(
          "Unable to retrieve the created dispatch record.",
          500,
        );
      }

      result = mapDispatch(populatedDispatch);
    });

    if (!result) {
      throw new AdminDispatchError(
        "Dispatch assignment could not be completed.",
        500,
      );
    }

    return result;
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new AdminDispatchError(
        "This order or tracking number already has a dispatch assignment.",
        409,
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

// ============================================
// UPDATE DISPATCH STATUS
// ============================================

export async function updateAdminDispatchStatus(
  dispatchId: string,
  status: DispatchStatus,
  adminId: string,
  note = "",
): Promise<AdminDispatch> {
  if (!Types.ObjectId.isValid(dispatchId)) {
    throw new AdminDispatchError("Invalid dispatch ID.");
  }

  if (!Types.ObjectId.isValid(adminId)) {
    throw new AdminDispatchError("Invalid administrator ID.");
  }

  if (!DISPATCH_STATUSES.includes(status)) {
    throw new AdminDispatchError("Invalid dispatch status.");
  }

  if (note.length > 500) {
    throw new AdminDispatchError("Status note cannot exceed 500 characters.");
  }

  const session = await mongoose.startSession();

  try {
    let result: AdminDispatch | null = null;

    await session.withTransaction(async () => {
      const dispatch =
        await DispatchModel.findById(dispatchId).session(session);

      if (!dispatch) {
        throw new AdminDispatchError(
          "Dispatch record could not be found.",
          404,
        );
      }

      const currentStatus = dispatch.status as DispatchStatus;

      if (!ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
        throw new AdminDispatchError(
          `Cannot change dispatch from ${currentStatus.replace("_", " ")} to ${status.replace("_", " ")}.`,
          409,
        );
      }

      const order = await OrderModel.findById(dispatch.orderId).session(
        session,
      );

      if (!order) {
        throw new AdminDispatchError(
          "The associated order could not be found.",
          404,
        );
      }

      if (order.paymentStatus !== "paid" || !order.paidPaymentId) {
        throw new AdminDispatchError(
          "The order no longer has a valid paid status.",
          409,
        );
      }

      const payment = await Payment.findOne({
        _id: order.paidPaymentId,
        orderId: order._id,
        userId: order.userId,
        status: "success",
        refundStatus: "not_required",
      }).session(session);

      if (!payment) {
        throw new AdminDispatchError(
          "The successful payment could not be verified.",
          409,
        );
      }

      const now = new Date();

      dispatch.status = status;

      if (status === "delivered") {
        dispatch.deliveredAt = now;
      }

      dispatch.statusHistory.push({
        previousStatus: currentStatus,
        status,
        note: note.trim(),
        adminId: new Types.ObjectId(adminId),
        createdAt: now,
      } as any);

      order.fulfilmentStatus = status;

      order.fulfilmentEvents.push({
        status,
        note: note.trim(),
        adminId: new Types.ObjectId(adminId),
        createdAt: now,
      } as any);

      await dispatch.save({ session });
      await order.save({ session });

      const populatedDispatch = await DispatchModel.findById(dispatch._id)
        .populate({
          path: "orderId",
          select: "userId items deliveryAddress total orderNumber",
        })
        .session(session)
        .lean();

      if (!populatedDispatch) {
        throw new AdminDispatchError(
          "Unable to retrieve the updated dispatch record.",
          500,
        );
      }

      result = mapDispatch(populatedDispatch);
    });

    if (!result) {
      throw new AdminDispatchError(
        "Dispatch status update could not be completed.",
        500,
      );
    }

    return result;
  } finally {
    await session.endSession();
  }
}
