import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

import OrderModel from "../models/Order.js";
import CartModel from "../models/Cart.js";
import ProductModel from "../models/product.model.js";
import Payment from "../models/Payment.js";
import DispatchModel from "../models/Dispatch.js";

import type { CreateOrderInput } from "../validators/order.validation.js";

const ORDER_RESERVATION_MINUTES = 15;
const MAX_ORDER_QUANTITY = 99;
const EXPIRATION_BATCH_SIZE = 100;

const DELIVERY_FEES = {
  standard: 5000,
  express: 10000,
  "same-day": 15000,
} as const;

export class OrderServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "OrderServiceError";
    this.statusCode = statusCode;
  }
}

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CartItemData {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAddition: number;
}

interface RemainingCartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAddition: number;
}

// ============================================
// CUSTOMER TRACKING RESPONSE TYPES
// ============================================

interface CustomerFulfilmentEvent {
  id: string;
  status: string;
  note: string;
  createdAt: Date;
}

interface CustomerDispatchInfo {
  deliveryPartner: string | null;
  trackingNumber: string | null;
  status: string;
  estimatedDelivery: Date | null;
  dispatchedAt: Date | null;
  deliveredAt: Date | null;
}

type CustomerOrderWithTracking = Record<string, unknown> & {
  fulfilmentStatus?: string;
  fulfilmentEvents: CustomerFulfilmentEvent[];
  dispatch: CustomerDispatchInfo | null;
};

// ============================================
// POPULATED PRODUCT CATEGORY TYPE
// ============================================

interface PopulatedProductCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  status: string;
}

// ============================================
// ORDER NUMBER
// ============================================

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const reference = randomBytes(4).toString("hex").toUpperCase();

  return `OGM-${date}-${reference}`;
}

// ============================================
// DELIVERY FEE CALCULATION
// ============================================

function calculateDeliveryFee(
  deliveryMethod: CreateOrderInput["deliveryMethod"],
  state: string,
): number {
  const normalizedState = state.trim().toLowerCase();

  const isAbuja =
    normalizedState === "abuja" ||
    normalizedState === "fct" ||
    normalizedState === "federal capital territory";

  if (deliveryMethod === "same-day" && !isAbuja) {
    throw new OrderServiceError(
      "Same-day delivery is currently available in Abuja only.",
      400,
    );
  }

  return DELIVERY_FEES[deliveryMethod];
}

// ============================================
// ORDER ITEM VALIDATION
// ============================================

function validateOrderItems(items: OrderItemInput[]): void {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderServiceError(
      "Select at least one product to checkout.",
      400,
    );
  }

  if (items.length > 100) {
    throw new OrderServiceError(
      "An order cannot contain more than 100 items.",
      400,
    );
  }

  const productIds = new Set<string>();

  for (const item of items) {
    if (!mongoose.isValidObjectId(item.productId)) {
      throw new OrderServiceError("Invalid product ID.", 400);
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_ORDER_QUANTITY
    ) {
      throw new OrderServiceError(
        `Quantity must be between 1 and ${MAX_ORDER_QUANTITY}.`,
        400,
      );
    }

    if (productIds.has(item.productId)) {
      throw new OrderServiceError(
        "Duplicate products are not allowed in an order.",
        400,
      );
    }

    productIds.add(item.productId);
  }
}

// ============================================
// CUSTOMER TRACKING MAPPER
// ============================================

function mapCustomerFulfilmentEvents(
  events: Array<{
    _id?: mongoose.Types.ObjectId;
    status: string;
    note?: string;
    createdAt: Date;
  }>,
): CustomerFulfilmentEvent[] {
  return events
    .map((event) => ({
      id: event._id?.toString() ?? "",
      status: event.status,
      note: event.note ?? "",
      createdAt: event.createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

function mapCustomerDispatch(
  dispatch:
    | {
        deliveryPartner?: string | null;
        trackingNumber?: string | null;
        status: string;
        estimatedDelivery?: Date | null;
        dispatchedAt?: Date | null;
        deliveredAt?: Date | null;
      }
    | null
    | undefined,
): CustomerDispatchInfo | null {
  if (!dispatch) {
    return null;
  }

  return {
    deliveryPartner: dispatch.deliveryPartner ?? null,
    trackingNumber: dispatch.trackingNumber ?? null,
    status: dispatch.status,
    estimatedDelivery: dispatch.estimatedDelivery ?? null,
    dispatchedAt: dispatch.dispatchedAt ?? null,
    deliveredAt: dispatch.deliveredAt ?? null,
  };
}

// ============================================
// ATTACH CUSTOMER TRACKING TO ORDERS
// ============================================

async function attachCustomerTracking<
  T extends {
    _id: mongoose.Types.ObjectId;
    fulfilmentStatus?: string;
    fulfilmentEvents?: Array<{
      _id?: mongoose.Types.ObjectId;
      status: string;
      note?: string;
      createdAt: Date;
    }>;
  },
>(orders: T[], userId: string): Promise<CustomerOrderWithTracking[]> {
  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order._id);

  // Retrieve dispatch records belonging to these orders
  // and the authenticated customer only.
  const dispatches = await DispatchModel.find({
    orderId: { $in: orderIds },
    userId,
  })
    .select(
      "orderId deliveryPartner trackingNumber status estimatedDelivery dispatchedAt deliveredAt",
    )
    .lean();

  const dispatchMap = new Map(
    dispatches.map((dispatch) => [dispatch.orderId.toString(), dispatch]),
  );

  return orders.map((order) => {
    const dispatch = dispatchMap.get(order._id.toString());

    return {
      ...order,
      fulfilmentEvents: mapCustomerFulfilmentEvents(
        order.fulfilmentEvents ?? [],
      ),
      dispatch: mapCustomerDispatch(dispatch),
    };
  });
}

// ============================================
// CREATE PENDING ORDER
// ============================================

export async function createPendingOrder(
  userId: string,
  input: CreateOrderInput,
) {
  validateOrderItems(input.items);

  const deliveryFee = calculateDeliveryFee(
    input.deliveryMethod,
    input.deliveryAddress.state,
  );

  const session = await mongoose.startSession();

  let createdOrder: InstanceType<typeof OrderModel> | null = null;

  try {
    await session.withTransaction(async () => {
      // ============================================
      // 1. GET CUSTOMER CART
      // ============================================

      const cart = await CartModel.findOne({ userId }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new OrderServiceError("Your cart is empty.", 400);
      }

      const typedCartItems = cart.items as unknown as CartItemData[];

      // ============================================
      // 2. VERIFY REQUESTED ITEMS ARE IN THE CART
      // ============================================

      const cartItems = new Map<string, CartItemData>(
        typedCartItems.map((item: CartItemData) => [
          item.productId.toString(),
          {
            productId: item.productId,
            quantity: item.quantity,
            priceAtAddition: item.priceAtAddition,
          },
        ]),
      );

      for (const requestedItem of input.items) {
        const cartItem = cartItems.get(requestedItem.productId);

        if (!cartItem) {
          throw new OrderServiceError(
            "One or more selected products are not in your cart.",
            400,
          );
        }

        if (requestedItem.quantity > cartItem.quantity) {
          throw new OrderServiceError(
            "Requested quantity exceeds the quantity in your cart.",
            400,
          );
        }
      }

      // ============================================
      // 3. FETCH CURRENT PRODUCTS AND THEIR CATEGORIES
      // ============================================

      const productIds = input.items.map((item) => item.productId);

      const products = await ProductModel.find({
        _id: { $in: productIds },
        status: "published",
      })
        .populate<{
          categoryId: PopulatedProductCategory | null;
        }>("categoryId", "name status")
        .session(session);

      const productMap = new Map(
        products.map((product) => [product._id.toString(), product]),
      );

      if (products.length !== input.items.length) {
        throw new OrderServiceError(
          "One or more products are unavailable or no longer published.",
          409,
        );
      }

      // ============================================
      // 4. CALCULATE TOTALS AND SNAPSHOT ORDER ITEMS
      // ============================================

      let subtotal = 0;

      const orderItems = input.items.map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new OrderServiceError(
            "A selected product is no longer available.",
            409,
          );
        }

        const category = product.categoryId;

        // Every newly purchased product must have a valid,
        // active category before an order can be created.
        if (!category || category.status !== "active") {
          throw new OrderServiceError(
            `${product.name} is assigned to an unavailable category. Please contact support.`,
            409,
          );
        }

        const unitPrice = product.price;
        const lineTotal = unitPrice * item.quantity;

        subtotal += lineTotal;

        return {
          productId: product._id,

          name: product.name,
          slug: product.slug,
          brand: product.brand,
          model: product.model,
          condition: product.condition,
          image: product.images[0]?.url ?? "",

          // Historical category snapshot.
          // These values are saved on the order item itself.
          categoryId: category._id,
          categoryName: category.name,

          quantity: item.quantity,
          unitPrice,
          lineTotal,
        };
      });

      const total = subtotal + deliveryFee;

      // ============================================
      // 5. ATOMICALLY RESERVE STOCK
      // ============================================

      for (const item of input.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new OrderServiceError(
            "A selected product is no longer available.",
            409,
          );
        }

        const stockUpdate = await ProductModel.findOneAndUpdate(
          {
            _id: item.productId,
            status: "published",
            stockQuantity: { $gte: item.quantity },
          },
          {
            $inc: {
              stockQuantity: -item.quantity,
            },
          },
          {
            new: false,
            session,
          },
        );

        if (!stockUpdate) {
          throw new OrderServiceError(
            `${product.name} does not have enough stock available. Please update your cart.`,
            409,
          );
        }
      }

      // ============================================
      // 6. CREATE PENDING ORDER
      // ============================================

      const reservationExpiresAt = new Date(
        Date.now() + ORDER_RESERVATION_MINUTES * 60 * 1000,
      );

      const [order] = await OrderModel.create(
        [
          {
            orderNumber: generateOrderNumber(),
            userId,
            items: orderItems,
            deliveryAddress: input.deliveryAddress,
            deliveryMethod: input.deliveryMethod,
            subtotal,
            deliveryFee,
            total,
            currency: "NGN",
            status: "pending",
            paymentStatus: "pending",
            paidPaymentId: null,
            paymentReference: null,
            reservationExpiresAt,
            stockRestoredAt: null,
          },
        ],
        { session },
      );

      // ============================================
      // 7. REMOVE PURCHASED QUANTITIES FROM CART
      // ============================================

      const remainingCartItems: RemainingCartItem[] = typedCartItems
        .map((cartItem: CartItemData): RemainingCartItem | null => {
          const purchasedItem = input.items.find(
            (item) => item.productId === cartItem.productId.toString(),
          );

          if (!purchasedItem) {
            return {
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              priceAtAddition: cartItem.priceAtAddition,
            };
          }

          const remainingQuantity = cartItem.quantity - purchasedItem.quantity;

          if (remainingQuantity <= 0) {
            return null;
          }

          return {
            productId: cartItem.productId,
            quantity: remainingQuantity,
            priceAtAddition: cartItem.priceAtAddition,
          };
        })
        .filter(
          (item: RemainingCartItem | null): item is RemainingCartItem =>
            item !== null,
        );

      cart.set("items", remainingCartItems);

      await cart.save({ session });

      createdOrder = order;
    });

    if (!createdOrder) {
      throw new OrderServiceError(
        "Order could not be created. Please try again.",
        500,
      );
    }

    return createdOrder;
  } catch (error: unknown) {
    if (error instanceof OrderServiceError) {
      throw error;
    }

    console.error("Create pending order error:", error);

    throw new OrderServiceError(
      "Something went wrong while creating your order. Please try again.",
      500,
    );
  } finally {
    await session.endSession();
  }
}

// ============================================
// RESTORE RESERVED STOCK AND CLOSE PAYMENT ATTEMPTS
// ============================================

async function restoreOrderStock(
  orderId: string,
  nextStatus: "cancelled" | "expired",
  options?: {
    userId?: string;
    onlyIfExpired?: boolean;
  },
) {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new OrderServiceError("Invalid order ID.", 400);
  }

  const session = await mongoose.startSession();

  let restoredOrder: InstanceType<typeof OrderModel> | null = null;

  try {
    await session.withTransaction(async () => {
      // ============================================
      // 1. CLAIM ORDER FOR STOCK RESTORATION
      // ============================================

      const filter: Record<string, unknown> = {
        _id: orderId,
        status: "pending",
        paymentStatus: "pending",
        stockRestoredAt: null,
      };

      if (options?.userId) {
        filter.userId = options.userId;
      }

      if (options?.onlyIfExpired) {
        filter.reservationExpiresAt = { $lte: new Date() };
      }

      const now = new Date();

      const order = await OrderModel.findOneAndUpdate(
        filter,
        {
          $set: {
            status: nextStatus,
            stockRestoredAt: now,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!order) {
        throw new OrderServiceError(
          options?.onlyIfExpired
            ? "Order is not eligible for expiration."
            : "Order not found or can no longer be cancelled.",
          409,
        );
      }

      // ============================================
      // 2. CLOSE ACTIVE PAYMENT ATTEMPTS
      // ============================================

      const closedPaymentStatus =
        nextStatus === "cancelled" ? "abandoned" : "expired";

      await Payment.updateMany(
        {
          orderId: order._id,
          activeAttempt: true,
          status: {
            $in: ["initializing", "pending"],
          },
        },
        {
          $set: {
            status: closedPaymentStatus,
            activeAttempt: false,
            failureReason:
              nextStatus === "cancelled"
                ? "Order was cancelled before payment completion. A later successful Paystack charge requires reconciliation."
                : "Order reservation expired before payment completion. A later successful Paystack charge requires reconciliation.",
          },
        },
        { session },
      );

      // ============================================
      // 3. RESTORE RESERVED PRODUCT STOCK
      // ============================================

      for (const item of order.items) {
        const result = await ProductModel.updateOne(
          {
            _id: item.productId,
          },
          {
            $inc: {
              stockQuantity: item.quantity,
            },
          },
          { session },
        );

        if (result.matchedCount !== 1) {
          throw new OrderServiceError(
            `Unable to restore stock for product ${item.productId}.`,
            500,
          );
        }
      }

      restoredOrder = order;
    });

    if (!restoredOrder) {
      throw new OrderServiceError(
        "Order stock restoration could not be completed.",
        500,
      );
    }

    return restoredOrder;
  } catch (error: unknown) {
    if (error instanceof OrderServiceError) {
      throw error;
    }

    console.error("Order stock restoration error:", error);

    throw new OrderServiceError(
      "Something went wrong while restoring reserved stock.",
      500,
    );
  } finally {
    await session.endSession();
  }
}

// ============================================
// CANCEL PENDING ORDER
// ============================================

export async function cancelPendingOrder(userId: string, orderId: string) {
  return restoreOrderStock(orderId, "cancelled", {
    userId,
  });
}

// ============================================
// EXPIRE ONE PENDING ORDER
// ============================================

async function expirePendingOrder(orderId: string) {
  return restoreOrderStock(orderId, "expired", {
    onlyIfExpired: true,
  });
}

// ============================================
// PROCESS EXPIRED PENDING ORDERS
// ============================================

export async function expirePendingOrders(): Promise<number> {
  const expiredCandidates = await OrderModel.find({
    status: "pending",
    paymentStatus: "pending",
    stockRestoredAt: null,
    reservationExpiresAt: { $lte: new Date() },
  })
    .select("_id")
    .sort({ reservationExpiresAt: 1 })
    .limit(EXPIRATION_BATCH_SIZE)
    .lean();

  let expiredCount = 0;

  for (const candidate of expiredCandidates) {
    try {
      await expirePendingOrder(candidate._id.toString());

      expiredCount += 1;
    } catch (error: unknown) {
      if (error instanceof OrderServiceError && error.statusCode === 409) {
        continue;
      }

      console.error(
        `Failed to expire order ${candidate._id.toString()}:`,
        error,
      );
    }
  }

  return expiredCount;
}

// ============================================
// GET ALL ORDERS FOR AN AUTHENTICATED CUSTOMER
// ============================================

export async function getCustomerOrders(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new OrderServiceError("Invalid customer ID.", 400);
  }

  const orders = await OrderModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return attachCustomerTracking(orders, userId);
}

// ============================================
// GET ONE ORDER FOR AN AUTHENTICATED CUSTOMER
// ============================================

export async function getCustomerOrderById(userId: string, orderId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new OrderServiceError("Invalid customer ID.", 400);
  }

  if (!mongoose.isValidObjectId(orderId)) {
    throw new OrderServiceError("Invalid order ID.", 400);
  }

  const order = await OrderModel.findOne({
    _id: orderId,
    userId,
  }).lean();

  if (!order) {
    throw new OrderServiceError("Order not found.", 404);
  }

  const [orderWithTracking] = await attachCustomerTracking([order], userId);

  return orderWithTracking;
}
