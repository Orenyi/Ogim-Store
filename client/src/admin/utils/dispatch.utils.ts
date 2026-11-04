import type { DispatchStatus } from "../types/dispatch.types";

export function getDispatchStatusLabel(status: DispatchStatus): string {
  const labels: Record<DispatchStatus, string> = {
    pending: "Pending",
    dispatched: "Dispatched",
    in_transit: "In Transit",
    delivered: "Delivered",
  };

  return labels[status];
}

export function formatDispatchDate(value: string | null): string {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDispatchDateOnly(value: string | null): string {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDispatchNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
