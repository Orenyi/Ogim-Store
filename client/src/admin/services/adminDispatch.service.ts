import { demoDispatches, demoDispatchSummary } from "../data/dispatch.mock";

import type {
  AssignDispatchInput,
  DispatchOrder,
  DispatchQuery,
  DispatchResponse,
  DispatchStatus,
  DispatchSummary,
} from "../types/dispatch.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

let dispatches = [...demoDispatches];

function calculateSummary(items: DispatchOrder[]): DispatchSummary {
  return {
    pending: items.filter((item) => item.status === "pending").length,
    dispatched: items.filter((item) => item.status === "dispatched").length,
    inTransit: items.filter((item) => item.status === "in_transit").length,
    delivered: items.filter((item) => item.status === "delivered").length,
    total: items.length,
  };
}

export async function getAdminDispatches(
  query: DispatchQuery,
): Promise<DispatchResponse> {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin dispatch API has not been connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  let filtered = [...dispatches];

  if (query.search.trim()) {
    const search = query.search.trim().toLowerCase();

    filtered = filtered.filter((item) =>
      [
        item.orderNumber,
        item.customer.fullName,
        item.customer.phoneNumber,
        item.deliveryPartner ?? "",
        item.trackingNumber ?? "",
        item.destination.city,
        item.destination.state,
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  if (query.status !== "all") {
    filtered = filtered.filter((item) => item.status === query.status);
  }

  if (query.partner !== "all") {
    filtered = filtered.filter(
      (item) => item.deliveryPartner === query.partner,
    );
  }

  if (query.startDate) {
    const start = new Date(`${query.startDate}T00:00:00`);

    filtered = filtered.filter((item) => new Date(item.createdAt) >= start);
  }

  if (query.endDate) {
    const end = new Date(`${query.endDate}T23:59:59.999`);

    filtered = filtered.filter((item) => new Date(item.createdAt) <= end);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.limit;

  return {
    dispatches: filtered.slice(startIndex, startIndex + query.limit),
    summary: USE_DEMO_DATA ? demoDispatchSummary : calculateSummary(dispatches),
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function assignAdminDispatch(
  input: AssignDispatchInput,
): Promise<DispatchOrder> {
  if (!USE_DEMO_DATA) {
    throw new Error("Dispatch assignment API has not been connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = dispatches.findIndex(
    (item) =>
      item.id === input.orderId ||
      item.orderId === input.orderId ||
      item.orderNumber === input.orderId,
  );

  if (index === -1) {
    throw new Error("The selected dispatch order could not be found.");
  }

  const current = dispatches[index];

  if (current.status !== "pending") {
    throw new Error("Only pending dispatches can be assigned.");
  }

  if (
    dispatches.some(
      (item) =>
        item.id !== current.id &&
        item.trackingNumber?.toLowerCase() ===
          input.trackingNumber.trim().toLowerCase(),
    )
  ) {
    throw new Error("This tracking number is already in use.");
  }

  const now = new Date().toISOString();

  const updated: DispatchOrder = {
    ...current,
    deliveryPartner: input.deliveryPartner,
    trackingNumber: input.trackingNumber.trim(),
    estimatedDelivery: input.estimatedDelivery,
    status: "dispatched",
    dispatchedAt: now,
    updatedAt: now,
  };

  dispatches[index] = updated;

  return updated;
}

export async function updateAdminDispatchStatus(
  dispatchId: string,
  status: DispatchStatus,
): Promise<DispatchOrder> {
  if (!USE_DEMO_DATA) {
    throw new Error("Dispatch status API has not been connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  const index = dispatches.findIndex((item) => item.id === dispatchId);

  if (index === -1) {
    throw new Error("Dispatch record could not be found.");
  }

  const current = dispatches[index];

  const allowedTransitions: Record<DispatchStatus, DispatchStatus[]> = {
    pending: ["dispatched"],
    dispatched: ["in_transit"],
    in_transit: ["delivered"],
    delivered: [],
  };

  if (!allowedTransitions[current.status].includes(status)) {
    throw new Error(
      `Cannot change dispatch from ${current.status.replace("_", " ")} to ${status.replace("_", " ")}.`,
    );
  }

  const now = new Date().toISOString();

  const updated: DispatchOrder = {
    ...current,
    status,
    updatedAt: now,
    deliveredAt: status === "delivered" ? now : current.deliveredAt,
  };

  dispatches[index] = updated;

  return updated;
}
