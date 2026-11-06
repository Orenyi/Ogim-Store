export type ProductCondition = "new" | "uk-used" | "refurbished";

export type ProductBrand =
  | "Apple"
  | "Samsung"
  | "Google"
  | "Xiaomi"
  | "Tecno"
  | "Infinix"
  | "Other";

/**
 * Cloudinary image metadata.
 * The URL is used to display the image.
 * The publicId is used to manage or delete it in Cloudinary.
 */
export interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
}

export interface ProductTechnicalSpecifications {
  storage?: string;
  ram?: string;
  color?: string;
  display?: string;
  battery?: string;
  camera?: string;
  operatingSystem?: string;
  network?: string;
  processor?: string;
  additionalFeatures?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  model?: string;
  description?: string;
  brand: ProductBrand;
  condition: ProductCondition;

  price: number;
  compareAtPrice?: number;

  storage: string;
  colour: string;

  /** Primary image URL used by storefront components. */
  image: string;

  /** Image URLs used by existing storefront components. */
  images?: string[];

  /** Complete image metadata returned by the backend. */
  imageDetails?: ProductImage[];

  specifications?: ProductTechnicalSpecifications;

  rating?: number;
  reviewCount?: number;

  inStock: boolean;
  stockQuantity?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventoryCategory = "all" | ProductBrand;

export interface InventoryProduct extends Product {
  sku: string;
  category: ProductBrand;
  stockQuantity: number;
  updatedAt: string;
}

export interface InventorySummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface InventoryQuery {
  search: string;
  category: InventoryCategory;
  status: InventoryStatus | "all";
  page: number;
  limit: number;
}

export interface InventoryResponse {
  products: InventoryProduct[];
  summary: InventorySummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Payload used when creating a product.
 *
 * Images must already have been uploaded to Cloudinary.
 * Their URLs and public IDs are saved with the product.
 */
export interface CreateInventoryProductInput {
  name: string;
  model: string;
  description: string;
  brand: ProductBrand;
  condition: ProductCondition;

  price: number;
  compareAtPrice?: number;

  storage: string;
  colour: string;

  stockQuantity: number;
  sku: string;

  /** Primary product image URL. */
  image: string;

  /** Complete Cloudinary image metadata. */
  images: ProductImage[];

  specifications: ProductTechnicalSpecifications;

  isFeatured: boolean;
  isNewArrival: boolean;
}

/**
 * Response returned by the pre-product Cloudinary upload endpoint.
 */
export interface ProductImageUploadResponse {
  success: boolean;
  message: string;
  data: ProductImage[];
}

export interface UpdateInventoryStockInput {
  stockQuantity: number;
}
