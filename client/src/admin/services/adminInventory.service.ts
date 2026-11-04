import {
  demoInventoryProducts,
  demoInventorySummary,
} from "../data/inventory.mock";

import type {
  CreateInventoryProductInput,
  InventoryProduct,
  InventoryQuery,
  InventoryResponse,
  InventorySummary,
} from "../types/inventory.types";

import {
  getInventoryStatus,
  createProductSlug,
} from "../utils/inventory.utils";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

let products = [...demoInventoryProducts];

function calculateSummary(items: InventoryProduct[]): InventorySummary {
  return {
    totalProducts: items.length,
    inStock: items.filter(
      (item) => getInventoryStatus(item.stockQuantity) === "in_stock",
    ).length,
    lowStock: items.filter(
      (item) => getInventoryStatus(item.stockQuantity) === "low_stock",
    ).length,
    outOfStock: items.filter(
      (item) => getInventoryStatus(item.stockQuantity) === "out_of_stock",
    ).length,
  };
}

export async function getAdminInventory(
  query: InventoryQuery,
): Promise<InventoryResponse> {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin inventory API has not been connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  let filtered = [...products];

  if (query.search.trim()) {
    const search = query.search.trim().toLowerCase();

    filtered = filtered.filter((product) =>
      [
        product.name,
        product.model ?? "",
        product.sku,
        product.brand,
        product.category,
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  if (query.category !== "all") {
    filtered = filtered.filter(
      (product) => product.category === query.category,
    );
  }

  if (query.status !== "all") {
    filtered = filtered.filter(
      (product) => getInventoryStatus(product.stockQuantity) === query.status,
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.limit;

  return {
    products: filtered.slice(startIndex, startIndex + query.limit),
    summary: USE_DEMO_DATA ? demoInventorySummary : calculateSummary(products),
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function createAdminProduct(
  input: CreateInventoryProductInput,
): Promise<InventoryProduct> {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin product creation API has not been connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const duplicateSku = products.some(
    (product) => product.sku.toLowerCase() === input.sku.trim().toLowerCase(),
  );

  if (duplicateSku) {
    throw new Error("A product with this SKU already exists.");
  }

  const now = new Date().toISOString();

  const product: InventoryProduct = {
    ...input,
    id: `inventory-${Date.now()}`,
    slug: createProductSlug(input.name),
    category: input.brand,
    model: input.model,
    inStock: input.stockQuantity > 0,
    stockQuantity: input.stockQuantity,
    updatedAt: now,
  };

  products = [product, ...products];

  return product;
}

export async function updateAdminProductStock(
  productId: string,
  quantity: number,
): Promise<InventoryProduct> {
  if (!USE_DEMO_DATA) {
    throw new Error("Inventory stock API has not been connected yet.");
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Stock quantity must be a non-negative whole number.");
  }

  const index = products.findIndex((product) => product.id === productId);

  if (index === -1) {
    throw new Error("Product could not be found.");
  }

  const updated: InventoryProduct = {
    ...products[index],
    stockQuantity: quantity,
    inStock: quantity > 0,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;

  return updated;
}
