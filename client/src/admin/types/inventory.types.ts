export type ProductCondition = "new" | "uk-used" | "refurbished";

export type ProductBrand =
  | "Apple"
  | "Samsung"
  | "Google"
  | "Xiaomi"
  | "Tecno"
  | "Infinix"
  | "Other";

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
  image: string;
  images?: string[];

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

export interface CreateInventoryProductInput {
  name: string;
  model?: string;
  description?: string;
  brand: ProductBrand;
  condition: ProductCondition;
  price: number;
  compareAtPrice?: number;
  storage: string;
  colour: string;
  stockQuantity: number;
  sku: string;
  image: string;
  images: string[];
  specifications: ProductTechnicalSpecifications;
  isFeatured: boolean;
  isNewArrival: boolean;
}

export interface UpdateInventoryStockInput {
  stockQuantity: number;
}
