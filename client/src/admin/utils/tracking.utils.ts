import type { TrackingEvent, TrackingStatus } from "../types/tracking.types";

export function formatTrackingDate(value: string, includeTime = false): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

export function formatTrackingRelativeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  const difference = Date.now() - date.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatTrackingDate(value);
}

export function getTrackingStatusLabel(status: TrackingStatus): string {
  const labels: Record<TrackingStatus, string> = {
    processing: "Processing",
    dispatched: "Dispatched",
    in_transit: "In Transit",
    delivered: "Delivered",
  };

  return labels[status];
}

export function getTrackingStatusColor(status: TrackingStatus): string {
  const styles: Record<TrackingStatus, string> = {
    processing: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    dispatched: "bg-blue-100 text-blue-700",
    in_transit: "bg-blue-100 text-blue-700",
    delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  };

  return styles[status];
}

export function getTrackingProgress(status: TrackingStatus): number {
  const progress: Record<TrackingStatus, number> = {
    processing: 1,
    dispatched: 2,
    in_transit: 3,
    delivered: 4,
  };

  return progress[status];
}

export function getTrackingEvents(events: TrackingEvent[]): TrackingEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getTrackingPartners(orders: { deliveryPartner: string }[]) {
  return [...new Set(orders.map((order) => order.deliveryPartner))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function getTrackingInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
