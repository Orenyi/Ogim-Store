import mongoose, { Types } from "mongoose";

import OrderModel, { ORDER_FULFILMENT_STATUSES } from "../models/Order.js";
import DispatchModel, {
  DELIVERY_PARTNERS,
  DISPATCH_STATUSES,
} from "../models/Dispatch.js";
import Payment from "../models/Payment.js";

// ============================================
// TYPES
// ============================================

export type TrackingStatus =
  | "processing"
  | "dispatched"
  | "in_transit"
  | "delivered";

type TrackingEventStatus = TrackingStatus | "placed";

export interface TrackingQuery {
  search: string;
  status: TrackingStatus | "all";
  partner: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

interface TrackingUpdateInput {
  orderId: string;
  status: TrackingStatus;
  note: string;
  trackingNumber?: string;
  deliveryPartner?: string;
}

interface TrackingEvent {
  id: string;
  title: string;
  description: string;
  status: TrackingEventStatus;
  timestamp: string;
  note?: string;
}

interface TrackingOrder {
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

interface TrackingSummary {
  totalTracked: number;
  inTransit: number;
  delivered: number;
  pendingUpdate: number;
}

interface TrackingResponse {
  orders: TrackingOrder[];
  summary: TrackingSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface OrderRecord {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  status: string;
  paymentStatus: string;
  paidPaymentId?: Types.ObjectId | null;
  fulfilmentStatus?: string;
  fulfilmentEvents: Array<{
    _id?: Types.ObjectId;
    status: string;
    note: string;
    adminId?: Types.ObjectId | null;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface DispatchRecord {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  deliveryPartner: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  statusHistory: Array<{
    _id?: Types.ObjectId;
    previousStatus: string;
    status: string;
    note: string;
    adminId: Types.ObjectId;
    createdAt: Date;
  }>;
}

interface PaymentRecord {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  status: string;
  refundStatus: string;
}

// ============================================
// CONSTANTS
// ============================================

const TRACKABLE_FULFILMENT_STATUSES = [
  "pending_dispatch",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
];

const TRACKING_EVENT_TITLES: Record<string, string> = {
  placed: "Order Placed",
  pending_dispatch: "Order Processing",
  processing: "Order Processing",
  dispatched: "Order Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
};

const TRACKING_EVENT_DESCRIPTIONS: Record<string, string> = {
  placed: "Your order has been successfully placed.",
  pending_dispatch: "Your order is being prepared for dispatch.",
  processing: "Your order is being processed.",
  dispatched: "Your order has been dispatched.",
  in_transit: "Your package is on its way.",
  delivered: "Your package has been delivered.",
};

// ============================================
// HELPERS
// ============================================

function createError(
  message: string,
  statusCode = 400,
): Error & {
  statusCode: number;
} {
  return Object.assign(new Error(message), { statusCode });
}

function normalizeTrackingStatus(status?: string): TrackingStatus {
  if (status === "pending_dispatch") {
    return "processing";
  }

  if (
    status === "processing" ||
    status === "dispatched" ||
    status === "in_transit" ||
    status === "delivered"
  ) {
    return status;
  }

  return "processing";
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getDestination(address: OrderRecord["deliveryAddress"]): string {
  return [address.address, address.city, address.state]
    .filter(Boolean)
    .join(", ");
}

function getEventTitle(status: string): string {
  return TRACKING_EVENT_TITLES[status] ?? "Tracking Update";
}

function getEventDescription(status: string): string {
  return (
    TRACKING_EVENT_DESCRIPTIONS[status] ??
    "Your order tracking information has been updated."
  );
}

function mapTrackingEvent(
  event: OrderRecord["fulfilmentEvents"][number],
): TrackingEvent {
  const status =
    event.status === "pending_dispatch"
      ? "processing"
      : (event.status as TrackingEventStatus);

  return {
    id: event._id?.toString() ?? new Types.ObjectId().toString(),
    title: getEventTitle(event.status),
    description: event.note || getEventDescription(event.status),
    status,
    timestamp: new Date(event.createdAt).toISOString(),
    ...(event.note ? { note: event.note } : {}),
  };
}

function mapTrackingOrder(
  order: OrderRecord,
  dispatch?: DispatchRecord,
): TrackingOrder {
  const events: TrackingEvent[] = [
    {
      id: `placed-${order._id.toString()}`,
      title: "Order Placed",
      description: TRACKING_EVENT_DESCRIPTIONS.placed,
      status: "placed",
      timestamp: new Date(order.createdAt).toISOString(),
    },
    ...(order.fulfilmentEvents ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map(mapTrackingEvent),
  ];

  return {
    id: order._id.toString(),
    orderId: order.orderNumber,
    customer: {
      id: order.userId.toString(),
      fullName: order.deliveryAddress.fullName,
      email: order.deliveryAddress.email,
      phoneNumber: order.deliveryAddress.phone,
      initials: getInitials(order.deliveryAddress.fullName),
    },
    trackingNumber: dispatch?.trackingNumber ?? "",
    deliveryPartner: dispatch?.deliveryPartner ?? "",
    status: normalizeTrackingStatus(order.fulfilmentStatus),
    destination: getDestination(order.deliveryAddress),
    lastUpdatedAt: new Date(order.updatedAt).toISOString(),
    events,
  };
}

function validateStatusTransition(
  currentStatus: string,
  nextStatus: TrackingStatus,
): void {
  const current = normalizeTrackingStatus(currentStatus);

  const allowedTransitions: Record<TrackingStatus, TrackingStatus[]> = {
    processing: ["processing", "dispatched"],
    dispatched: ["dispatched", "in_transit"],
    in_transit: ["in_transit", "delivered"],
    delivered: ["delivered"],
  };

  if (!allowedTransitions[current].includes(nextStatus)) {
    throw createError(
      `Invalid tracking transition: ${current} cannot be changed to ${nextStatus}.`,
      409,
    );
  }
}

function validatePartner(partner: string): void {
  if (!partner) {
    return;
  }

  if (
    !DELIVERY_PARTNERS.includes(partner as (typeof DELIVERY_PARTNERS)[number])
  ) {
    throw createError(
      "Invalid delivery partner. Select a supported delivery partner.",
    );
  }
}

function validateTrackingNumber(trackingNumber: string): void {
  if (trackingNumber.length > 100) {
    throw createError("Tracking number cannot exceed 100 characters.");
  }
}

function validateDateRange(
  startDate: string,
  endDate: string,
): { start?: Date; end?: Date } {
  const result: { start?: Date; end?: Date } = {};

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);

    if (Number.isNaN(start.getTime())) {
      throw createError("Invalid tracking start date.");
    }

    result.start = start;
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999Z`);

    if (Number.isNaN(end.getTime())) {
      throw createError("Invalid tracking end date.");
    }

    result.end = end;
  }

  if (
    result.start &&
    result.end &&
    result.start.getTime() > result.end.getTime()
  ) {
    throw createError("Start date cannot be later than end date.");
  }

  return result;
}

// ============================================
// PAID ORDER VERIFICATION
// ============================================

async function getVerifiedPaidOrderIds(
  orders: OrderRecord[],
): Promise<Set<string>> {
  if (!orders.length) {
    return new Set();
  }

  const eligibleOrders = orders.filter(
    (order) =>
      order.paymentStatus === "paid" &&
      order.paidPaymentId &&
      order.status !== "cancelled" &&
      order.status !== "expired",
  );

  if (!eligibleOrders.length) {
    return new Set();
  }

  const paymentIds = eligibleOrders.map((order) => order.paidPaymentId);

  const payments = (await Payment.find({
    _id: { $in: paymentIds },
    status: "success",
    refundStatus: "not_required",
  })
    .select("_id orderId userId status refundStatus")
    .lean()) as unknown as PaymentRecord[];

  const validPaymentIds = new Set(
    payments.map((payment) => payment._id.toString()),
  );

  return new Set(
    eligibleOrders
      .filter((order) => {
        const paymentId = order.paidPaymentId?.toString();

        if (!paymentId || !validPaymentIds.has(paymentId)) {
          return false;
        }

        const payment = payments.find(
          (item) => item._id.toString() === paymentId,
        );

        return (
          payment !== undefined &&
          payment.orderId.toString() === order._id.toString() &&
          payment.userId.toString() === order.userId.toString() &&
          payment.status === "success" &&
          payment.refundStatus === "not_required"
        );
      })
      .map((order) => order._id.toString()),
  );
}

// ============================================
// LOAD TRACKING DATA
// ============================================

async function loadTrackingOrders(): Promise<TrackingOrder[]> {
  const orders = (await OrderModel.find({
    fulfilmentStatus: {
      $in: TRACKABLE_FULFILMENT_STATUSES,
    },
    paymentStatus: "paid",
    paidPaymentId: { $ne: null },
    status: { $nin: ["cancelled", "expired"] },
  })
    .sort({ createdAt: -1 })
    .lean()) as unknown as OrderRecord[];

  if (!orders.length) {
    return [];
  }

  const verifiedOrderIds = await getVerifiedPaidOrderIds(orders);

  const validOrders = orders.filter((order) =>
    verifiedOrderIds.has(order._id.toString()),
  );

  if (!validOrders.length) {
    return [];
  }

  const orderIds = validOrders.map((order) => order._id);

  const dispatches = (await DispatchModel.find({
    orderId: { $in: orderIds },
  }).lean()) as unknown as DispatchRecord[];

  const dispatchMap = new Map(
    dispatches.map((dispatch) => [dispatch.orderId.toString(), dispatch]),
  );

  return validOrders.map((order) =>
    mapTrackingOrder(order, dispatchMap.get(order._id.toString())),
  );
}

// ============================================
// GET ADMIN TRACKING ORDERS
// ============================================

export async function getAdminTrackingOrders(
  query: TrackingQuery,
): Promise<TrackingResponse> {
  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(Number(query.limit) || 10)),
  );

  const allOrders = await loadTrackingOrders();

  // Summary is calculated from all eligible tracked orders,
  // independently of the selected filters and pagination.
  const summary: TrackingSummary = {
    totalTracked: allOrders.length,
    inTransit: allOrders.filter((order) => order.status === "in_transit")
      .length,
    delivered: allOrders.filter((order) => order.status === "delivered").length,
    pendingUpdate: allOrders.filter(
      (order) => order.status === "processing" || order.status === "dispatched",
    ).length,
  };

  let filteredOrders = [...allOrders];

  const search = query.search?.trim().toLowerCase();

  if (search) {
    filteredOrders = filteredOrders.filter((order) => {
      return (
        order.orderId.toLowerCase().includes(search) ||
        order.customer.fullName.toLowerCase().includes(search) ||
        order.customer.email.toLowerCase().includes(search) ||
        order.customer.phoneNumber.toLowerCase().includes(search) ||
        order.trackingNumber.toLowerCase().includes(search)
      );
    });
  }

  if (query.status && query.status !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === query.status,
    );
  }

  if (query.partner?.trim()) {
    const partner = query.partner.trim().toLowerCase();

    filteredOrders = filteredOrders.filter((order) =>
      order.deliveryPartner.toLowerCase().includes(partner),
    );
  }

  const { start, end } = validateDateRange(
    query.startDate ?? "",
    query.endDate ?? "",
  );

  if (start) {
    filteredOrders = filteredOrders.filter((order) => {
      const orderDate = new Date(order.lastUpdatedAt);
      return orderDate >= start;
    });
  }

  if (end) {
    filteredOrders = filteredOrders.filter((order) => {
      const orderDate = new Date(order.lastUpdatedAt);
      return orderDate <= end;
    });
  }

  const total = filteredOrders.length;
  const totalPages = Math.ceil(total / limit);

  const startIndex = (page - 1) * limit;

  return {
    orders: filteredOrders.slice(startIndex, startIndex + limit),
    summary,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// ============================================
// GET SINGLE TRACKING ORDER
// ============================================

export async function getAdminTrackingOrderById(
  orderId: string,
): Promise<TrackingOrder> {
  if (!mongoose.isValidObjectId(orderId)) {
    throw createError("Invalid order ID.", 400);
  }

  const order = (await OrderModel.findById(
    orderId,
  ).lean()) as OrderRecord | null;

  if (!order) {
    throw createError("Order not found.", 404);
  }

  const verifiedOrderIds = await getVerifiedPaidOrderIds([order]);

  if (!verifiedOrderIds.has(order._id.toString())) {
    throw createError("Tracking is unavailable for this order.", 404);
  }

  const dispatch = (await DispatchModel.findOne({
    orderId: order._id,
  }).lean()) as DispatchRecord | null;

  return mapTrackingOrder(order, dispatch ?? undefined);
}

// ============================================
// UPDATE ADMIN TRACKING
// ============================================

export async function updateAdminTracking(
  input: TrackingUpdateInput,
  adminId: string,
): Promise<TrackingOrder> {
  if (!mongoose.isValidObjectId(input.orderId)) {
    throw createError("Invalid order ID.", 400);
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw createError("Invalid administrator ID.", 401);
  }

  if (
    !input.status ||
    !["processing", "dispatched", "in_transit", "delivered"].includes(
      input.status,
    )
  ) {
    throw createError("Select a valid tracking status.");
  }

  const note = input.note?.trim();

  if (!note) {
    throw createError("A customer-visible tracking note is required.");
  }

  if (note.length > 500) {
    throw createError("Tracking note cannot exceed 500 characters.");
  }

  const trackingNumber = input.trackingNumber?.trim() ?? "";
  const deliveryPartner = input.deliveryPartner?.trim() ?? "";

  validateTrackingNumber(trackingNumber);
  validatePartner(deliveryPartner);

  const session = await mongoose.startSession();

  try {
    let updatedTrackingOrder: TrackingOrder | null = null;

    await session.withTransaction(async () => {
      const order = (await OrderModel.findById(input.orderId)
        .session(session)
        .exec()) as unknown as
        | (OrderRecord & {
            save: (options?: {
              session?: mongoose.ClientSession;
            }) => Promise<unknown>;
          })
        | null;

      if (!order) {
        throw createError("Order not found.", 404);
      }

      if (
        order.paymentStatus !== "paid" ||
        !order.paidPaymentId ||
        order.status === "cancelled" ||
        order.status === "expired"
      ) {
        throw createError(
          "Only successfully paid and active orders can be tracked.",
          409,
        );
      }

      const payment = (await Payment.findOne({
        _id: order.paidPaymentId,
        orderId: order._id,
        userId: order.userId,
        status: "success",
        refundStatus: "not_required",
      })
        .session(session)
        .lean()) as PaymentRecord | null;

      if (!payment) {
        throw createError(
          "Tracking updates are unavailable for this payment.",
          409,
        );
      }

      const currentFulfilmentStatus =
        order.fulfilmentStatus ?? "pending_dispatch";

      if (
        !ORDER_FULFILMENT_STATUSES.includes(
          currentFulfilmentStatus as (typeof ORDER_FULFILMENT_STATUSES)[number],
        )
      ) {
        throw createError("The order has an invalid fulfilment status.", 409);
      }

      if (currentFulfilmentStatus === "cancelled") {
        throw createError(
          "Cancelled orders cannot receive tracking updates.",
          409,
        );
      }

      validateStatusTransition(currentFulfilmentStatus, input.status);

      const needsDispatch =
        input.status === "dispatched" ||
        input.status === "in_transit" ||
        input.status === "delivered";

      let dispatch = (await DispatchModel.findOne({
        orderId: order._id,
      }).session(session)) as unknown as DispatchRecord | null;

      if (needsDispatch && !dispatch) {
        throw createError(
          "A dispatch record must exist before this tracking status can be applied. Assign the order through Dispatch Management first.",
          409,
        );
      }

      if (dispatch) {
        if (
          deliveryPartner &&
          !DELIVERY_PARTNERS.includes(
            deliveryPartner as (typeof DELIVERY_PARTNERS)[number],
          )
        ) {
          throw createError("Unsupported delivery partner.");
        }

        if (trackingNumber) {
          const duplicateTrackingNumber = await DispatchModel.findOne({
            trackingNumber,
            _id: { $ne: dispatch._id },
          })
            .session(session)
            .select("_id")
            .lean();

          if (duplicateTrackingNumber) {
            throw createError(
              "This tracking number is already assigned to another order.",
              409,
            );
          }
        }

        const previousDispatchStatus = dispatch.status;

        if (input.status !== "processing") {
          if (
            !DISPATCH_STATUSES.includes(
              input.status as (typeof DISPATCH_STATUSES)[number],
            )
          ) {
            throw createError("Invalid dispatch status.");
          }

          dispatch.status = input.status;

          if (input.status === "delivered") {
            dispatch.deliveredAt = new Date();
          }
        }

        if (deliveryPartner) {
          dispatch.deliveryPartner = deliveryPartner;
        }

        if (trackingNumber) {
          dispatch.trackingNumber = trackingNumber;
        }

        // Only create a dispatch history event when the actual
        // dispatch status changes.
        if (
          input.status !== "processing" &&
          previousDispatchStatus !== input.status
        ) {
          dispatch.statusHistory.push({
            previousStatus: previousDispatchStatus,
            status: input.status,
            note,
            adminId: new Types.ObjectId(adminId),
            createdAt: new Date(),
          });
        }

        await DispatchModel.updateOne(
          { _id: dispatch._id },
          {
            $set: {
              status: dispatch.status,
              deliveryPartner: dispatch.deliveryPartner,
              trackingNumber: dispatch.trackingNumber,
              ...(dispatch.deliveredAt
                ? { deliveredAt: dispatch.deliveredAt }
                : {}),
            },
            $push: {
              ...(input.status !== "processing" &&
              previousDispatchStatus !== input.status
                ? {
                    statusHistory:
                      dispatch.statusHistory[dispatch.statusHistory.length - 1],
                  }
                : {}),
            },
          },
          { session },
        );
      } else if (deliveryPartner || trackingNumber) {
        throw createError(
          "Assign a dispatch before changing delivery partner or tracking number.",
          409,
        );
      }

      // If the order is still pending dispatch, a Processing
      // update records a customer-visible event without changing
      // pending_dispatch. This preserves dispatch eligibility.
      const persistedFulfilmentStatus =
        currentFulfilmentStatus === "pending_dispatch" &&
        input.status === "processing"
          ? "pending_dispatch"
          : input.status;

      const now = new Date();

      order.fulfilmentStatus = persistedFulfilmentStatus;

      order.fulfilmentEvents.push({
        status: persistedFulfilmentStatus,
        note,
        adminId: new Types.ObjectId(adminId),
        createdAt: now,
      });

      await OrderModel.updateOne(
        { _id: order._id },
        {
          $set: {
            fulfilmentStatus: persistedFulfilmentStatus,
          },
          $push: {
            fulfilmentEvents: {
              status: persistedFulfilmentStatus,
              note,
              adminId: new Types.ObjectId(adminId),
              createdAt: now,
            },
          },
        },
        { session },
      );

      const refreshedOrder = (await OrderModel.findById(order._id)
        .session(session)
        .lean()) as unknown as OrderRecord | null;

      const refreshedDispatch = (await DispatchModel.findOne({
        orderId: order._id,
      })
        .session(session)
        .lean()) as unknown as DispatchRecord | null;

      if (!refreshedOrder) {
        throw createError(
          "Unable to retrieve the updated tracking record.",
          500,
        );
      }

      updatedTrackingOrder = mapTrackingOrder(
        refreshedOrder,
        refreshedDispatch ?? undefined,
      );
    });

    if (!updatedTrackingOrder) {
      throw createError("Tracking update could not be completed.", 500);
    }

    return updatedTrackingOrder;
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw createError(
        "The tracking number is already assigned to another order.",
        409,
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
