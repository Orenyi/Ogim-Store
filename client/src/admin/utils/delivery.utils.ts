export function formatDeliveryCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDeliveryStatusLabel(status: string): string {
  return status === "active" ? "Active" : "Inactive";
}

export function getDeliveryStates(locations: { state: string }[]): string[] {
  return [...new Set(locations.map((item) => item.state))].sort((a, b) =>
    a.localeCompare(b),
  );
}
