import mongoose from "mongoose";

import DeliveryFeeModel from "../models/DeliveryFee.js";

// ============================================
// TYPES
// ============================================

export type AdminDeliveryFeeStatus = "active" | "inactive";

export interface AdminDeliveryFeeInput {
  location: string;
  state: string;
  country: string;
  fee: number;
  estimatedDelivery: string;
  status: AdminDeliveryFeeStatus;
}

export interface AdminDeliveryFeesQuery {
  search?: string;
  state?: string;
  status?: AdminDeliveryFeeStatus | "all";
  page?: number;
  limit?: number;
}

export class AdminDeliveryServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminDeliveryServiceError";
    this.statusCode = statusCode;
  }
}

// ============================================
// VALIDATION
// ============================================

function validateDeliveryFeeInput(input: AdminDeliveryFeeInput): void {
  if (!input || typeof input !== "object") {
    throw new AdminDeliveryServiceError("Invalid delivery fee information.");
  }

  if (
    typeof input.location !== "string" ||
    !input.location.trim() ||
    input.location.trim().length > 100
  ) {
    throw new AdminDeliveryServiceError("Enter a valid delivery location.");
  }

  if (
    typeof input.state !== "string" ||
    !input.state.trim() ||
    input.state.trim().length > 100
  ) {
    throw new AdminDeliveryServiceError("Enter a valid state or FCT.");
  }

  if (
    typeof input.country !== "string" ||
    !input.country.trim() ||
    input.country.trim().length > 100
  ) {
    throw new AdminDeliveryServiceError("Enter a valid country.");
  }

  if (!Number.isSafeInteger(input.fee) || input.fee < 0) {
    throw new AdminDeliveryServiceError(
      "Delivery fee must be a valid non-negative whole number.",
    );
  }

  if (
    typeof input.estimatedDelivery !== "string" ||
    !input.estimatedDelivery.trim() ||
    input.estimatedDelivery.trim().length > 100
  ) {
    throw new AdminDeliveryServiceError(
      "Enter a valid estimated delivery time.",
    );
  }

  if (!["active", "inactive"].includes(input.status)) {
    throw new AdminDeliveryServiceError("Invalid delivery fee status.");
  }
}

// ============================================
// NORMALIZE INPUT
// ============================================

function normalizeDeliveryFeeInput(input: AdminDeliveryFeeInput) {
  return {
    location: input.location.trim(),
    state: input.state.trim(),
    country: input.country.trim(),
    fee: input.fee,
    estimatedDelivery: input.estimatedDelivery.trim(),
    status: input.status,
  };
}

// ============================================
// HANDLE DUPLICATE LOCATION ERRORS
// ============================================

function handleDatabaseError(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    throw new AdminDeliveryServiceError(
      "A delivery fee already exists for this location and state.",
      409,
    );
  }

  throw error;
}

// ============================================
// SUMMARY
// ============================================

async function getDeliverySummary() {
  const [summary] = await DeliveryFeeModel.aggregate([
    {
      $group: {
        _id: null,
        totalLocations: { $sum: 1 },
        activeFees: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
          },
        },
        inactiveFees: {
          $sum: {
            $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    totalLocations: summary?.totalLocations ?? 0,
    activeFees: summary?.activeFees ?? 0,
    inactiveFees: summary?.inactiveFees ?? 0,
    defaultFee: 0,
  };
}

// ============================================
// GET DELIVERY FEES
// ============================================

export async function getAdminDeliveryFees(query: AdminDeliveryFeesQuery = {}) {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(query.limit ?? 8)));

  const filter: Record<string, unknown> = {};

  if (query.search?.trim()) {
    const search = query.search.trim();

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { location: { $regex: escapedSearch, $options: "i" } },
      { state: { $regex: escapedSearch, $options: "i" } },
      { country: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  if (query.state && query.state !== "all") {
    filter.state = query.state;
  }

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  const [fees, total, summary] = await Promise.all([
    DeliveryFeeModel.find(filter)
      .sort({ state: 1, location: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    DeliveryFeeModel.countDocuments(filter),

    getDeliverySummary(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    fees: fees.map((fee) => ({
      id: fee._id.toString(),
      location: fee.location,
      state: fee.state,
      country: fee.country,
      fee: fee.fee,
      estimatedDelivery: fee.estimatedDelivery,
      status: fee.status,
      createdAt: fee.createdAt.toISOString(),
      updatedAt: fee.updatedAt.toISOString(),
    })),

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
// CREATE DELIVERY FEE
// ============================================

export async function createAdminDeliveryFee(input: AdminDeliveryFeeInput) {
  validateDeliveryFeeInput(input);

  try {
    const fee = await DeliveryFeeModel.create(normalizeDeliveryFeeInput(input));

    return {
      id: fee._id.toString(),
      location: fee.location,
      state: fee.state,
      country: fee.country,
      fee: fee.fee,
      estimatedDelivery: fee.estimatedDelivery,
      status: fee.status,
      createdAt: fee.createdAt.toISOString(),
      updatedAt: fee.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    handleDatabaseError(error);
  }
}

// ============================================
// UPDATE DELIVERY FEE
// ============================================

export async function updateAdminDeliveryFee(
  id: string,
  input: Partial<AdminDeliveryFeeInput>,
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminDeliveryServiceError("Invalid delivery fee ID.", 400);
  }

  if (!input || typeof input !== "object") {
    throw new AdminDeliveryServiceError(
      "Invalid delivery fee information.",
      400,
    );
  }

  const allowedFields = [
    "location",
    "state",
    "country",
    "fee",
    "estimatedDelivery",
    "status",
  ];

  if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
    throw new AdminDeliveryServiceError("Unsupported delivery fee field.", 400);
  }

  const existing = await DeliveryFeeModel.findById(id);

  if (!existing) {
    throw new AdminDeliveryServiceError(
      "Delivery fee could not be found.",
      404,
    );
  }

  const mergedInput: AdminDeliveryFeeInput = {
    location: input.location ?? existing.location,
    state: input.state ?? existing.state,
    country: input.country ?? existing.country,
    fee: input.fee ?? existing.fee,
    estimatedDelivery: input.estimatedDelivery ?? existing.estimatedDelivery,
    status: input.status ?? existing.status,
  };

  validateDeliveryFeeInput(mergedInput);

  try {
    const updated = await DeliveryFeeModel.findByIdAndUpdate(
      id,
      {
        $set: normalizeDeliveryFeeInput(mergedInput),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      throw new AdminDeliveryServiceError(
        "Delivery fee could not be found.",
        404,
      );
    }

    return {
      id: updated._id.toString(),
      location: updated.location,
      state: updated.state,
      country: updated.country,
      fee: updated.fee,
      estimatedDelivery: updated.estimatedDelivery,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    handleDatabaseError(error);
  }
}

// ============================================
// TOGGLE DELIVERY FEE STATUS
// ============================================

export async function toggleAdminDeliveryFee(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminDeliveryServiceError("Invalid delivery fee ID.", 400);
  }

  const fee = await DeliveryFeeModel.findById(id);

  if (!fee) {
    throw new AdminDeliveryServiceError(
      "Delivery fee could not be found.",
      404,
    );
  }

  fee.status = fee.status === "active" ? "inactive" : "active";

  await fee.save();

  return {
    id: fee._id.toString(),
    location: fee.location,
    state: fee.state,
    country: fee.country,
    fee: fee.fee,
    estimatedDelivery: fee.estimatedDelivery,
    status: fee.status,
    createdAt: fee.createdAt.toISOString(),
    updatedAt: fee.updatedAt.toISOString(),
  };
}

// ============================================
// DUPLICATE DELIVERY FEE
// ============================================

export async function duplicateAdminDeliveryFee(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminDeliveryServiceError("Invalid delivery fee ID.", 400);
  }

  const original = await DeliveryFeeModel.findById(id).lean();

  if (!original) {
    throw new AdminDeliveryServiceError(
      "Delivery fee could not be found.",
      404,
    );
  }

  let copyLocation = `${original.location} (Copy)`;
  let suffix = 2;

  while (
    await DeliveryFeeModel.exists({
      location: copyLocation,
      state: original.state,
      country: original.country,
    }).collation({ locale: "en", strength: 2 })
  ) {
    copyLocation = `${original.location} (Copy ${suffix})`;
    suffix += 1;
  }

  try {
    const copy = await DeliveryFeeModel.create({
      location: copyLocation,
      state: original.state,
      country: original.country,
      fee: original.fee,
      estimatedDelivery: original.estimatedDelivery,
      status: "inactive",
    });

    return {
      id: copy._id.toString(),
      location: copy.location,
      state: copy.state,
      country: copy.country,
      fee: copy.fee,
      estimatedDelivery: copy.estimatedDelivery,
      status: copy.status,
      createdAt: copy.createdAt.toISOString(),
      updatedAt: copy.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    handleDatabaseError(error);
  }
}

// ============================================
// DELETE DELIVERY FEE
// ============================================

export async function deleteAdminDeliveryFee(id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminDeliveryServiceError("Invalid delivery fee ID.", 400);
  }

  const deleted = await DeliveryFeeModel.findByIdAndDelete(id);

  if (!deleted) {
    throw new AdminDeliveryServiceError(
      "Delivery fee could not be found.",
      404,
    );
  }
}
