import type {
  InventoryProduct,
  InventoryStatus,
} from "../types/inventory.types";

export const LOW_STOCK_THRESHOLD = 10;

export function getInventoryStatus(quantity: number): InventoryStatus {
  if (quantity <= 0) return "out_of_stock";

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return "low_stock";
  }

  return "in_stock";
}

export function getProductInventoryStatus(
  product: InventoryProduct,
): InventoryStatus {
  return getInventoryStatus(product.stockQuantity);
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createProductSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
