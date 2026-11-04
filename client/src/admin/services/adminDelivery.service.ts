import { demoDeliveryFees } from "../data/delivery.mock";

import type {
  DeliveryFee,
  DeliveryFeeInput,
  DeliveryFeeUpdate,
  DeliveryFeesQuery,
  DeliveryFeesResponse,
  DeliverySummary,
} from "../types/delivery.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

// Demo-only in-memory store.
// Changes reset when the browser page is refreshed.
let deliveryFees = [...demoDeliveryFees];

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

function getSummary(): DeliverySummary {
  return {
    totalLocations: deliveryFees.length,
    activeFees: deliveryFees.filter((fee) => fee.status === "active").length,
    inactiveFees: deliveryFees.filter((fee) => fee.status === "inactive")
      .length,
    defaultFee: 2500,
  };
}

function ensureDemoMode() {
  if (!USE_DEMO_DATA) {
    throw new Error("Delivery settings API has not been connected yet.");
  }
}

export async function getAdminDeliveryFees(
  query: DeliveryFeesQuery,
): Promise<DeliveryFeesResponse> {
  ensureDemoMode();
  await delay();

  let filtered = [...deliveryFees];

  if (query.search.trim()) {
    const search = query.search.trim().toLowerCase();

    filtered = filtered.filter((fee) =>
      [fee.location, fee.state, fee.country].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }

  if (query.state !== "all") {
    filtered = filtered.filter((fee) => fee.state === query.state);
  }

  if (query.status !== "all") {
    filtered = filtered.filter((fee) => fee.status === query.status);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.limit;

  return {
    fees: filtered.slice(startIndex, startIndex + query.limit),
    summary: getSummary(),
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function createAdminDeliveryFee(
  input: DeliveryFeeInput,
): Promise<DeliveryFee> {
  ensureDemoMode();
  await delay();

  const duplicate = deliveryFees.some(
    (fee) =>
      fee.location.toLowerCase() === input.location.trim().toLowerCase() &&
      fee.state.toLowerCase() === input.state.trim().toLowerCase(),
  );

  if (duplicate) {
    throw new Error(
      "A delivery fee already exists for this location and state.",
    );
  }

  const now = new Date().toISOString();

  const fee: DeliveryFee = {
    ...input,
    id: `delivery-${Date.now()}`,
    location: input.location.trim(),
    state: input.state.trim(),
    country: input.country.trim(),
    createdAt: now,
    updatedAt: now,
  };

  deliveryFees = [fee, ...deliveryFees];

  return fee;
}

export async function updateAdminDeliveryFee(
  id: string,
  input: DeliveryFeeUpdate,
): Promise<DeliveryFee> {
  ensureDemoMode();
  await delay();

  const index = deliveryFees.findIndex((fee) => fee.id === id);

  if (index === -1) {
    throw new Error("Delivery fee could not be found.");
  }

  const updated: DeliveryFee = {
    ...deliveryFees[index],
    ...input,
    location: input.location?.trim() ?? deliveryFees[index].location,
    state: input.state?.trim() ?? deliveryFees[index].state,
    country: input.country?.trim() ?? deliveryFees[index].country,
    updatedAt: new Date().toISOString(),
  };

  deliveryFees[index] = updated;

  return updated;
}

export async function toggleAdminDeliveryFee(id: string): Promise<DeliveryFee> {
  ensureDemoMode();
  await delay();

  const fee = deliveryFees.find((item) => item.id === id);

  if (!fee) {
    throw new Error("Delivery fee could not be found.");
  }

  fee.status = fee.status === "active" ? "inactive" : "active";
  fee.updatedAt = new Date().toISOString();

  return fee;
}

export async function duplicateAdminDeliveryFee(
  id: string,
): Promise<DeliveryFee> {
  ensureDemoMode();
  await delay();

  const original = deliveryFees.find((item) => item.id === id);

  if (!original) {
    throw new Error("Delivery fee could not be found.");
  }

  const copy: DeliveryFee = {
    ...original,
    id: `delivery-${Date.now()}`,
    location: `${original.location} (Copy)`,
    status: "inactive",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  deliveryFees = [copy, ...deliveryFees];

  return copy;
}

export async function deleteAdminDeliveryFee(id: string): Promise<void> {
  ensureDemoMode();
  await delay();

  const exists = deliveryFees.some((fee) => fee.id === id);

  if (!exists) {
    throw new Error("Delivery fee could not be found.");
  }

  deliveryFees = deliveryFees.filter((fee) => fee.id !== id);
}
