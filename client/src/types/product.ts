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
  /** Optional previous price, used for sale displays. */
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

export interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}
