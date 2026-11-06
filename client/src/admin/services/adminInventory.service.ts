import { apiRequest } from "../../lib/api";

import type {
  CreateInventoryProductInput,
  InventoryProduct,
  InventoryQuery,
  InventoryResponse,
  InventorySummary,
  ProductCondition,
  ProductImage,
} from "../types/inventory.types";

import { createProductSlug } from "../utils/inventory.utils";

// ============================================
// BACKEND TYPES
// ============================================

type BackendCondition = "brand-new" | "uk-used" | "refurbished";

interface BackendImage {
  url: string;
  publicId?: string;
  alt?: string;
}

interface BackendProduct {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  sku?: string;
  model?: string;
  description?: string;
  brand: string;
  condition: BackendCondition;
  price: number;
  compareAtPrice?: number;
  specifications?: Record<string, unknown>;
  images?: BackendImage[];
  stockQuantity: number;
  status?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  summary?: InventorySummary;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

interface BackendStockUpdate {
  id: string;
  sku?: string;
  name: string;
  stockQuantity: number;
  inStock: boolean;
  inventoryStatus?: string;
  updatedAt: string;
}

// ============================================
// LOCAL CACHE
// ============================================

const inventoryCache = new Map<string, InventoryProduct>();

const DEFAULT_SUMMARY: InventorySummary = {
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
};

// ============================================
// CONDITION MAPPING
// ============================================

function mapCondition(condition: BackendCondition): ProductCondition {
  return condition === "brand-new" ? "new" : condition;
}

function toBackendCondition(condition: ProductCondition): BackendCondition {
  return condition === "new" ? "brand-new" : condition;
}

// ============================================
// PRODUCT MAPPING
// ============================================

function mapBackendProduct(product: BackendProduct): InventoryProduct {
  const id = product._id || product.id;

  if (!id) {
    throw new Error(
      `The backend returned "${product.name}" without a product ID.`,
    );
  }

  const imageDetails: ProductImage[] = (product.images || [])
    .filter((image) => Boolean(image.url))
    .map((image) => ({
      url: image.url,
      publicId: image.publicId || "",
      alt: image.alt || `${product.name} product image`,
    }));

  const images = imageDetails.map((image) => image.url);

  const specifications = product.specifications || {};
  const stockQuantity = Number(product.stockQuantity ?? 0);
  const brand = product.brand as InventoryProduct["brand"];

  const mapped: InventoryProduct = {
    id,
    slug: product.slug || createProductSlug(product.name),
    name: product.name,
    sku: product.sku || "—",
    model: product.model || "",
    description: product.description || "",
    brand,
    category: brand,
    condition: mapCondition(product.condition),
    price: Number(product.price || 0),
    compareAtPrice: product.compareAtPrice,
    storage: String(specifications.storage || ""),
    colour: String(specifications.color || ""),
    image: images[0] || "",
    images,
    imageDetails,

    specifications: {
      storage: String(specifications.storage || ""),
      ram: String(specifications.ram || ""),
      color: String(specifications.color || ""),
      display: String(specifications.display || ""),
      battery: String(specifications.battery || ""),
      camera: String(specifications.camera || ""),
      operatingSystem: String(specifications.operatingSystem || ""),
      network: String(specifications.network || ""),
      processor: String(specifications.processor || ""),
      additionalFeatures: Array.isArray(specifications.additionalFeatures)
        ? specifications.additionalFeatures.map(String)
        : [],
    },

    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: stockQuantity > 0,
    stockQuantity,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    updatedAt:
      product.updatedAt || product.createdAt || new Date().toISOString(),
  };

  inventoryCache.set(id, mapped);

  return mapped;
}

// ============================================
// CLOUDINARY IMAGE UPLOAD
// ============================================

/**
 * POST /products/admin/images
 *
 * Upload product images through the protected backend endpoint.
 * Cloudinary credentials remain on the backend.
 */
export async function uploadAdminProductImages(
  files: File[],
): Promise<ProductImage[]> {
  if (!files.length) {
    throw new Error("Select at least one image to upload.");
  }

  if (files.length > 5) {
    throw new Error("You can upload a maximum of five images at a time.");
  }

  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      throw new Error(
        `${file.name}: Only JPEG, PNG, WebP and AVIF images are allowed.`,
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`${file.name}: Image size cannot exceed 5 MB.`);
    }
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await apiRequest<ApiResponse<ProductImage[]>>(
    "/products/admin/images",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message || "Unable to upload product images.");
  }

  if (response.data.length !== files.length) {
    throw new Error("The server returned an incomplete image upload result.");
  }

  return response.data.map((image) => {
    if (!image.url || !image.publicId) {
      throw new Error("An uploaded image is missing Cloudinary metadata.");
    }

    return {
      url: image.url,
      publicId: image.publicId,
      alt: image.alt || "Product image",
    };
  });
}

// ============================================
// CLOUDINARY IMAGE DELETE
// ============================================

/**
 * DELETE /products/admin/images
 *
 * Deletes an uploaded image from Cloudinary before product creation.
 *
 * The backend receives publicIds as an array.
 */
export async function deleteAdminProductImage(publicId: string): Promise<void> {
  const normalizedPublicId = publicId.trim();

  if (!normalizedPublicId) {
    throw new Error("A valid Cloudinary image ID is required.");
  }

  const response = await apiRequest<
    ApiResponse<{
      deletedCount?: number;
      publicIds?: string[];
    }>
  >("/products/admin/images", {
    method: "DELETE",
    body: JSON.stringify({
      publicIds: [normalizedPublicId],
    }),
  });

  if (!response.success) {
    throw new Error(response.message || "Unable to delete product image.");
  }
}

// ============================================
// GET ADMIN INVENTORY
// ============================================

/**
 * GET /products/admin/inventory
 *
 * Fetch authenticated admin inventory.
 * Supports search, brand, stock status and pagination.
 */
export async function getAdminInventory(
  query: InventoryQuery,
): Promise<InventoryResponse> {
  const params = new URLSearchParams({
    search: query.search.trim(),
    category: query.category,
    status: query.status,
    page: String(query.page),
    limit: String(query.limit),
  });

  const response = await apiRequest<ApiResponse<BackendProduct[]>>(
    `/products/admin/inventory?${params.toString()}`,
  );

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(
      response.message || "Unable to retrieve inventory products.",
    );
  }

  const products = response.data.map(mapBackendProduct);

  return {
    products,
    summary: response.summary || DEFAULT_SUMMARY,

    pagination: {
      page: response.pagination?.page ?? query.page,
      limit: response.pagination?.limit ?? query.limit,
      total: response.pagination?.total ?? products.length,
      totalPages: response.pagination?.totalPages ?? 1,
    },
  };
}

// ============================================
// CREATE ADMIN PRODUCT
// ============================================

/**
 * POST /products
 *
 * Create a product and publish it immediately.
 * Images must already be uploaded to Cloudinary.
 */
export async function createAdminProduct(
  input: CreateInventoryProductInput,
): Promise<InventoryProduct> {
  if (!input.name.trim()) {
    throw new Error("Product name is required.");
  }

  if (!input.model.trim()) {
    throw new Error("Product model is required.");
  }

  if (!input.description.trim()) {
    throw new Error("Product description is required.");
  }

  if (!input.sku.trim()) {
    throw new Error("Product SKU is required.");
  }

  if (!input.images.length) {
    throw new Error("Please upload at least one product image.");
  }

  if (input.images.length > 10) {
    throw new Error("A product can have a maximum of 10 images.");
  }

  for (const image of input.images) {
    if (!image.url || !image.publicId) {
      throw new Error(
        "Every product image must have a valid Cloudinary URL and public ID.",
      );
    }
  }

  if (
    input.compareAtPrice !== undefined &&
    input.compareAtPrice <= input.price
  ) {
    throw new Error("Compare-at price must be greater than the selling price.");
  }

  const specifications = {
    ...input.specifications,
    storage: input.storage,
    color: input.colour,
  };

  const payload = {
    name: input.name.trim(),
    slug: createProductSlug(input.name),
    sku: input.sku.trim().toUpperCase(),
    model: input.model.trim(),
    description: input.description.trim(),
    brand: input.brand,
    condition: toBackendCondition(input.condition),
    price: input.price,

    ...(input.compareAtPrice !== undefined && {
      compareAtPrice: input.compareAtPrice,
    }),

    specifications,

    images: input.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
      alt: image.alt || `${input.name} product image`,
    })),

    stockQuantity: input.stockQuantity,
    status: "published",
    isFeatured: input.isFeatured,
    isNewArrival: input.isNewArrival,
  };

  const response = await apiRequest<ApiResponse<BackendProduct>>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || "Unable to create product.");
  }

  return mapBackendProduct(response.data);
}

// ============================================
// UPDATE ADMIN PRODUCT STOCK
// ============================================

/**
 * PATCH /products/:id/stock
 *
 * Set the new total available stock quantity.
 * This does not increment or decrement the existing quantity.
 */
export async function updateAdminProductStock(
  productId: string,
  quantity: number,
): Promise<InventoryProduct> {
  if (!productId) {
    throw new Error("A valid product ID is required.");
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Stock quantity must be a non-negative whole number.");
  }

  const response = await apiRequest<ApiResponse<BackendStockUpdate>>(
    `/products/${encodeURIComponent(productId)}/stock`,
    {
      method: "PATCH",
      body: JSON.stringify({
        stockQuantity: quantity,
      }),
    },
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Unable to update product stock.");
  }

  const updated = response.data;
  const existing = inventoryCache.get(productId);

  if (!existing) {
    return {
      id: updated.id,
      slug: createProductSlug(updated.name),
      name: updated.name,
      sku: updated.sku || "—",
      brand: "Other",
      category: "Other",
      condition: "new",
      price: 0,
      storage: "",
      colour: "",
      image: "",
      images: [],
      imageDetails: [],
      inStock: updated.inStock,
      stockQuantity: updated.stockQuantity,
      updatedAt: updated.updatedAt,
    };
  }

  const updatedProduct: InventoryProduct = {
    ...existing,
    id: updated.id || existing.id,
    sku: updated.sku || existing.sku,
    name: updated.name || existing.name,
    stockQuantity: updated.stockQuantity,
    inStock: updated.inStock,
    updatedAt: updated.updatedAt || new Date().toISOString(),
  };

  inventoryCache.set(productId, updatedProduct);

  return updatedProduct;
}
