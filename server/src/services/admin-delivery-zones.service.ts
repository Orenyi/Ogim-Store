import mongoose from "mongoose";
import DeliveryZoneModel from "../models/DeliveryZone.js";

export interface AdminDeliveryZone {
  id: string;
  name: string;
  state: string;
  locations: string[];
  estimatedDelivery: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface AdminDeliveryZoneInput {
  name: string;
  state: string;
  locations: string[];
  estimatedDelivery: string;
  status?: "active" | "inactive";
}

export interface AdminDeliveryZonesQuery {
  search?: string;
  state?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
}

export interface AdminDeliveryZonesResponse {
  zones: AdminDeliveryZone[];
  summary: {
    totalZones: number;
    activeZones: number;
    inactiveZones: number;
    totalLocations: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AdminDeliveryZoneError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminDeliveryZoneError";
    this.statusCode = statusCode;
  }
}

function normalizeLocations(locations: string[]): string[] {
  if (!Array.isArray(locations)) {
    throw new AdminDeliveryZoneError("Locations must be an array.");
  }

  const normalized = locations.map((location) =>
    typeof location === "string" ? location.trim() : "",
  );

  if (
    normalized.length === 0 ||
    normalized.some((location) => !location || location.length > 100)
  ) {
    throw new AdminDeliveryZoneError(
      "Provide at least one valid delivery location.",
    );
  }

  const uniqueLocations = new Set(
    normalized.map((location) => location.toLowerCase()),
  );

  if (uniqueLocations.size !== normalized.length) {
    throw new AdminDeliveryZoneError(
      "A delivery zone cannot contain duplicate locations.",
    );
  }

  return normalized;
}

function normalizeInput(input: AdminDeliveryZoneInput): AdminDeliveryZoneInput {
  if (!input || typeof input !== "object") {
    throw new AdminDeliveryZoneError("Invalid delivery zone data.");
  }

  const name = input.name?.trim();
  const state = input.state?.trim();
  const estimatedDelivery = input.estimatedDelivery?.trim();

  if (!name || name.length > 100) {
    throw new AdminDeliveryZoneError(
      "Zone name is required and must not exceed 100 characters.",
    );
  }

  if (!state || state.length > 100) {
    throw new AdminDeliveryZoneError(
      "State is required and must not exceed 100 characters.",
    );
  }

  if (!estimatedDelivery || estimatedDelivery.length > 100) {
    throw new AdminDeliveryZoneError(
      "Estimated delivery is required and must not exceed 100 characters.",
    );
  }

  if (
    input.status !== undefined &&
    !["active", "inactive"].includes(input.status)
  ) {
    throw new AdminDeliveryZoneError("Invalid delivery zone status.");
  }

  return {
    name,
    state,
    locations: normalizeLocations(input.locations),
    estimatedDelivery,
    status: input.status ?? "active",
  };
}

function mapZone(zone: any): AdminDeliveryZone {
  return {
    id: zone._id.toString(),
    name: zone.name,
    state: zone.state,
    locations: zone.locations,
    estimatedDelivery: zone.estimatedDelivery,
    status: zone.status,
    createdAt: zone.createdAt.toISOString(),
    updatedAt: zone.updatedAt.toISOString(),
  };
}

async function ensureLocationsAvailable(
  state: string,
  locations: string[],
  excludeZoneId?: string,
): Promise<void> {
  const query: Record<string, unknown> = {
    state,
    locations: {
      $in: locations,
    },
  };

  if (excludeZoneId) {
    query._id = {
      $ne: new mongoose.Types.ObjectId(excludeZoneId),
    };
  }

  const existingZone = await DeliveryZoneModel.findOne(query).collation({
    locale: "en",
    strength: 2,
  });

  if (existingZone) {
    const conflictingLocations = locations.filter((location) =>
      existingZone.locations.some(
        (existing: string) => existing.toLowerCase() === location.toLowerCase(),
      ),
    );

    throw new AdminDeliveryZoneError(
      `These locations already belong to another delivery zone: ${conflictingLocations.join(", ")}.`,
      409,
    );
  }
}

// ============================================
// GET DELIVERY ZONES
// ============================================

export async function getAdminDeliveryZones(
  query: AdminDeliveryZonesQuery = {},
): Promise<AdminDeliveryZonesResponse> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

  const search = query.search?.trim();
  const state = query.state?.trim();
  const status = query.status ?? "all";

  const filter: Record<string, unknown> = {};

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { state: { $regex: escapedSearch, $options: "i" } },
      { locations: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  if (state && state !== "all") {
    filter.state = state;
  }

  if (status !== "all") {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [zones, total, totalZones, activeZones, inactiveZones, allZones] =
    await Promise.all([
      DeliveryZoneModel.find(filter)
        .sort({ state: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      DeliveryZoneModel.countDocuments(filter),

      DeliveryZoneModel.countDocuments(),

      DeliveryZoneModel.countDocuments({ status: "active" }),

      DeliveryZoneModel.countDocuments({ status: "inactive" }),

      DeliveryZoneModel.find({}, { locations: 1 }).lean(),
    ]);

  const totalLocations = new Set(
    allZones.flatMap((zone) =>
      zone.locations.map((location: string) => location.toLowerCase()),
    ),
  ).size;

  return {
    zones: zones.map(mapZone),
    summary: {
      totalZones,
      activeZones,
      inactiveZones,
      totalLocations,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// CREATE DELIVERY ZONE
// ============================================

export async function createAdminDeliveryZone(
  input: AdminDeliveryZoneInput,
): Promise<AdminDeliveryZone> {
  const data = normalizeInput(input);

  await ensureLocationsAvailable(data.state, data.locations);

  try {
    const zone = await DeliveryZoneModel.create(data);
    return mapZone(zone);
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new AdminDeliveryZoneError(
        "A delivery zone with this name already exists in this state.",
        409,
      );
    }

    throw error;
  }
}

// ============================================
// UPDATE DELIVERY ZONE
// ============================================

export async function updateAdminDeliveryZone(
  id: string,
  input: Partial<AdminDeliveryZoneInput>,
): Promise<AdminDeliveryZone> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AdminDeliveryZoneError("Invalid delivery zone ID.", 400);
  }

  const existingZone = await DeliveryZoneModel.findById(id);

  if (!existingZone) {
    throw new AdminDeliveryZoneError("Delivery zone not found.", 404);
  }

  const data = normalizeInput({
    name: input.name ?? existingZone.name,
    state: input.state ?? existingZone.state,
    locations: input.locations ?? existingZone.locations,
    estimatedDelivery:
      input.estimatedDelivery ?? existingZone.estimatedDelivery,
    status: input.status ?? existingZone.status,
  });

  await ensureLocationsAvailable(data.state, data.locations, id);

  try {
    Object.assign(existingZone, data);
    await existingZone.save();

    return mapZone(existingZone);
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new AdminDeliveryZoneError(
        "A delivery zone with this name already exists in this state.",
        409,
      );
    }

    throw error;
  }
}

// ============================================
// TOGGLE DELIVERY ZONE STATUS
// ============================================

export async function toggleAdminDeliveryZone(
  id: string,
): Promise<AdminDeliveryZone> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AdminDeliveryZoneError("Invalid delivery zone ID.", 400);
  }

  const zone = await DeliveryZoneModel.findById(id);

  if (!zone) {
    throw new AdminDeliveryZoneError("Delivery zone not found.", 404);
  }

  zone.status = zone.status === "active" ? "inactive" : "active";

  await zone.save();

  return mapZone(zone);
}

// ============================================
// DELETE DELIVERY ZONE
// ============================================

export async function deleteAdminDeliveryZone(id: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AdminDeliveryZoneError("Invalid delivery zone ID.", 400);
  }

  const zone = await DeliveryZoneModel.findByIdAndDelete(id);

  if (!zone) {
    throw new AdminDeliveryZoneError("Delivery zone not found.", 404);
  }
}
