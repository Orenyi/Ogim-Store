import mongoose, { Types } from "mongoose";

import User from "../models/User.js";
import OrderModel from "../models/Order.js";

export type CustomerStatusFilter = "all" | "active" | "inactive";
export type CustomerOrderFilter = "all" | "yes" | "no";

interface CustomerOrderItem {
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminCustomersQuery {
  search: string;
  status: CustomerStatusFilter;
  hasOrders: CustomerOrderFilter;
  page: number;
  limit: number;
}

export interface CustomerStatusUpdate {
  status: "active" | "inactive";
}

export class CustomerServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CustomerServiceError";
    this.statusCode = statusCode;
  }
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

function mapCustomerStatus(status: string): "active" | "inactive" {
  return status === "disabled" ? "inactive" : "active";
}

function getMonthBoundaries() {
  const now = new Date();

  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const previousMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  return {
    now,
    currentMonthStart,
    previousMonthStart,
  };
}

function calculatePercentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Count distinct customers who had placed orders by a given date.
 */
async function countCustomersWithOrdersBy(date: Date): Promise<number> {
  const customerIds = await OrderModel.distinct("userId", {
    createdAt: { $lt: date },
    userId: { $exists: true, $ne: null },
  });

  if (!customerIds.length) {
    return 0;
  }

  return User.countDocuments({
    _id: { $in: customerIds },
    role: "customer",
    createdAt: { $lt: date },
  });
}

/**
 * Global customer statistics and month-over-month comparisons.
 *
 * Deleted customer records remain included in totalCustomers.
 * Inactive accounts are identified using deletedAt.
 */
export async function getCustomerSummary() {
  const { now, currentMonthStart, previousMonthStart } = getMonthBoundaries();

  const [
    totalCustomers,
    previousTotalCustomers,
    newCustomers,
    previousNewCustomers,
    inactiveAccounts,
    previousInactiveAccounts,
    customersWithOrders,
    previousCustomersWithOrders,
  ] = await Promise.all([
    // All registered customers, including deleted accounts.
    User.countDocuments({
      role: "customer",
      createdAt: { $lte: now },
    }),

    // Customers registered before the current month.
    User.countDocuments({
      role: "customer",
      createdAt: { $lt: currentMonthStart },
    }),

    // Registrations during the current month.
    User.countDocuments({
      role: "customer",
      createdAt: {
        $gte: currentMonthStart,
        $lte: now,
      },
    }),

    // Registrations during the previous month.
    User.countDocuments({
      role: "customer",
      createdAt: {
        $gte: previousMonthStart,
        $lt: currentMonthStart,
      },
    }),

    // Accounts deleted up to the current date.
    User.countDocuments({
      role: "customer",
      deletedAt: { $ne: null, $lte: now },
    }),

    // Accounts deleted before the current month.
    User.countDocuments({
      role: "customer",
      deletedAt: {
        $ne: null,
        $lt: currentMonthStart,
      },
    }),

    countCustomersWithOrdersBy(new Date(now.getTime() + 1)),

    countCustomersWithOrdersBy(currentMonthStart),
  ]);

  return {
    totalCustomers,
    newCustomers,
    customersWithOrders,
    inactiveAccounts,

    percentageChanges: {
      totalCustomers: calculatePercentageChange(
        totalCustomers,
        previousTotalCustomers,
      ),

      newCustomers: calculatePercentageChange(
        newCustomers,
        previousNewCustomers,
      ),

      customersWithOrders: calculatePercentageChange(
        customersWithOrders,
        previousCustomersWithOrders,
      ),

      inactiveAccounts: calculatePercentageChange(
        inactiveAccounts,
        previousInactiveAccounts,
      ),
    },
  };
}

/**
 * List customers with search, filters, order statistics and pagination.
 *
 * Deleted customers remain visible in the admin dashboard.
 */
export async function getCustomers(query: AdminCustomersQuery) {
  const page = Math.max(1, query.page);
  const limit = Math.min(50, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = {
    role: "customer",
  };

  if (query.status === "active") {
    match.status = "active";
    match.deletedAt = null;
  } else if (query.status === "inactive") {
    match.deletedAt = { $ne: null };
  }

  if (query.search.trim()) {
    const searchRegex = new RegExp(escapeRegex(query.search.trim()), "i");

    match.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },

    {
      $lookup: {
        from: OrderModel.collection.name,
        let: { customerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$customerId"] },
            },
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
                },
              },
            },
          },
        ],
        as: "orderSummary",
      },
    },

    {
      $addFields: {
        totalOrders: {
          $ifNull: [{ $arrayElemAt: ["$orderSummary.totalOrders", 0] }, 0],
        },
        totalSpent: {
          $ifNull: [{ $arrayElemAt: ["$orderSummary.totalSpent", 0] }, 0],
        },
      },
    },
  ];

  if (query.hasOrders === "yes") {
    pipeline.push({
      $match: { totalOrders: { $gt: 0 } },
    });
  } else if (query.hasOrders === "no") {
    pipeline.push({
      $match: { totalOrders: 0 },
    });
  }

  pipeline.push({
    $facet: {
      customers: [
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            fullName: 1,
            email: 1,
            phoneNumber: 1,
            status: 1,
            deletedAt: 1,
            createdAt: 1,
            totalOrders: 1,
            totalSpent: 1,
          },
        },
      ],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await User.aggregate(pipeline);

  const customers = (result?.customers ?? []).map(
    (customer: {
      _id: Types.ObjectId;
      fullName: string;
      email: string;
      phoneNumber?: string;
      status: string;
      deletedAt?: Date | null;
      createdAt: Date;
      totalOrders: number;
      totalSpent: number;
    }) => ({
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber ?? "",
      initials: getInitials(customer.fullName),
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      status: customer.deletedAt
        ? "inactive"
        : mapCustomerStatus(customer.status),
      joinedAt: customer.createdAt.toISOString(),
    }),
  );

  const total = result?.total?.[0]?.count ?? 0;

  return {
    customers,
    summary: await getCustomerSummary(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * Get one customer's account information and order statistics.
 */
export async function getCustomerById(customerId: string) {
  if (!mongoose.isValidObjectId(customerId)) {
    throw new CustomerServiceError("Invalid customer ID.", 400);
  }

  const customer = await User.findOne({
    _id: customerId,
    role: "customer",
  })
    .select(
      "fullName email phoneNumber status deletedAt emailVerifiedAt createdAt updatedAt",
    )
    .lean();

  if (!customer) {
    throw new CustomerServiceError("Customer not found.", 404);
  }

  const [orderStats] = await OrderModel.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(customerId),
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
          },
        },
      },
    },
  ]);

  return {
    id: customer._id.toString(),
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber ?? "",
    initials: getInitials(customer.fullName),
    status: customer.deletedAt
      ? "inactive"
      : mapCustomerStatus(customer.status),
    deletedAt: customer.deletedAt,
    emailVerified: Boolean(customer.emailVerifiedAt),
    emailVerifiedAt: customer.emailVerifiedAt,
    joinedAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    totalOrders: orderStats?.totalOrders ?? 0,
    totalSpent: orderStats?.totalSpent ?? 0,
  };
}

/**
 * Get a customer's order history.
 */
export async function getCustomerOrders(
  customerId: string,
  page = 1,
  limit = 10,
) {
  if (!mongoose.isValidObjectId(customerId)) {
    throw new CustomerServiceError("Invalid customer ID.", 400);
  }

  const customerExists = await User.exists({
    _id: customerId,
    role: "customer",
  });

  if (!customerExists) {
    throw new CustomerServiceError("Customer not found.", 404);
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const filter = {
    userId: new Types.ObjectId(customerId),
  };

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .select(
        "orderNumber items subtotal deliveryFee total currency status paymentStatus deliveryMethod createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    OrderModel.countDocuments(filter),
  ]);

  return {
    orders: orders.map((order) => {
      const items = order.items as CustomerOrderItem[];

      return {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        items: items.map((item: CustomerOrderItem) => ({
          name: item.name,
          image: item.image ?? "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryMethod: order.deliveryMethod,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    }),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

/**
 * Activate or disable a customer account.
 *
 * Deleted accounts cannot be reactivated through this action.
 */
export async function updateCustomerStatus(
  customerId: string,
  input: CustomerStatusUpdate,
) {
  if (!mongoose.isValidObjectId(customerId)) {
    throw new CustomerServiceError("Invalid customer ID.", 400);
  }

  const databaseStatus = input.status === "inactive" ? "disabled" : "active";

  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "customer",
      deletedAt: null,
    },
    {
      $set: { status: databaseStatus },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  )
    .select("fullName email phoneNumber status deletedAt createdAt")
    .lean();

  if (!customer) {
    throw new CustomerServiceError(
      "Customer not found or account has been deleted.",
      404,
    );
  }

  return {
    id: customer._id.toString(),
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber ?? "",
    initials: getInitials(customer.fullName),
    status: customer.deletedAt
      ? "inactive"
      : mapCustomerStatus(customer.status),
    joinedAt: customer.createdAt.toISOString(),
  };
}
