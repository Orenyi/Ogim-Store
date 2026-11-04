import { demoTrackingOrders, demoTrackingSummary } from "../data/tracking.mock";

import type {
  TrackingOrder,
  TrackingQuery,
  TrackingResponse,
  TrackingUpdateInput,
} from "../types/tracking.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

// Keep the mock collection mutable while the app is running.
let mockOrders: TrackingOrder[] = structuredClone(demoTrackingOrders);

function ensureDemoMode() {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin tracking API has not been connected yet.");
  }
}

export async function getAdminTrackingOrders(
  query: TrackingQuery,
): Promise<TrackingResponse> {
  ensureDemoMode();

  await new Promise((resolve) => setTimeout(resolve, 250));

  let filtered = [...mockOrders];

  if (query.search.trim()) {
    const search = query.search.trim().toLowerCase();

    filtered = filtered.filter((order) => {
      const values = [
        order.orderId,
        order.customer.fullName,
        order.customer.email,
        order.customer.phoneNumber,
        order.trackingNumber,
        order.deliveryPartner,
        order.destination,
      ];

      return values.some((value) => value.toLowerCase().includes(search));
    });
  }

  if (query.status !== "all") {
    filtered = filtered.filter((order) => order.status === query.status);
  }

  if (query.partner !== "all") {
    filtered = filtered.filter(
      (order) => order.deliveryPartner === query.partner,
    );
  }

  if (query.startDate) {
    const start = new Date(`${query.startDate}T00:00:00`);

    filtered = filtered.filter(
      (order) => new Date(order.lastUpdatedAt) >= start,
    );
  }

  if (query.endDate) {
    const end = new Date(`${query.endDate}T23:59:59.999`);

    filtered = filtered.filter((order) => new Date(order.lastUpdatedAt) <= end);
  }

  filtered.sort(
    (a, b) =>
      new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.limit;

  return {
    orders: filtered.slice(startIndex, startIndex + query.limit),
    summary: {
      ...demoTrackingSummary,
      totalTracked: mockOrders.length,
      inTransit: mockOrders.filter((order) => order.status === "in_transit")
        .length,
      delivered: mockOrders.filter((order) => order.status === "delivered")
        .length,
      pendingUpdate: mockOrders.filter((order) => order.status === "processing")
        .length,
    },
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function getAdminTrackingOrderById(
  orderId: string,
): Promise<TrackingOrder> {
  ensureDemoMode();

  await new Promise((resolve) => setTimeout(resolve, 150));

  const order = mockOrders.find(
    (item) => item.id === orderId || item.orderId === orderId,
  );

  if (!order) {
    throw new Error("The requested tracking order could not be found.");
  }

  return structuredClone(order);
}

export async function updateAdminTracking(
  input: TrackingUpdateInput,
): Promise<TrackingOrder> {
  ensureDemoMode();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockOrders.findIndex(
    (item) => item.id === input.orderId || item.orderId === input.orderId,
  );

  if (index === -1) {
    throw new Error("Order not found.");
  }

  const current = mockOrders[index];
  const now = new Date().toISOString();

  const statusDetails = {
    processing: {
      title: "Processing",
      description: "Your order is being prepared for dispatch.",
    },
    dispatched: {
      title: "Dispatched",
      description: "Your order has been handed to the delivery partner.",
    },
    in_transit: {
      title: "In Transit",
      description: "Your order is on the way to your location.",
    },
    delivered: {
      title: "Delivered",
      description: "Your order has been delivered.",
    },
  }[input.status];

  const updatedOrder: TrackingOrder = {
    ...current,
    status: input.status,
    lastUpdatedAt: now,
    trackingNumber: input.trackingNumber?.trim() || current.trackingNumber,
    deliveryPartner: input.deliveryPartner?.trim() || current.deliveryPartner,
    events: [
      ...current.events,
      {
        id: `event-${Date.now()}`,
        title: statusDetails.title,
        description: statusDetails.description,
        status: input.status,
        timestamp: now,
        note: input.note.trim(),
      },
    ],
  };

  mockOrders[index] = updatedOrder;

  return structuredClone(updatedOrder);
}
