import { apiRequest } from "../lib/api";
import type { Product } from "../types/product";

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  brand: Product["brand"];
  condition: "brand-new" | "uk-used" | "refurbished";
  price: number;
  compareAtPrice?: number;
  specifications?: {
    storage?: string;
    color?: string;
  };
  images?: {
    url: string;
    alt?: string;
  }[];
  stockQuantity: number;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProductQuery {
  search?: string;
  brand?: string[];
  condition?: string[];
  storage?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: "all" | "in-stock" | "out-of-stock";
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapProduct(product: ApiProduct): Product {
  return {
    id: product._id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    condition: product.condition === "brand-new" ? "new" : product.condition,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    storage: product.specifications?.storage ?? "",
    colour: product.specifications?.color ?? "",
    image: product.images?.[0]?.url ?? "",
    images: product.images?.map((image) => image.url) ?? [],
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockQuantity: product.stockQuantity,
    inStock: product.stockQuantity > 0,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
  };
}

export async function getProducts(
  query: ProductQuery = {},
): Promise<ProductListResult> {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  query.brand?.forEach((brand) => params.append("brand", brand));
  query.condition?.forEach((condition) =>
    params.append("condition", condition === "new" ? "brand-new" : condition),
  );
  query.storage?.forEach((storage) => params.append("storage", storage));

  if (query.minPrice !== undefined) {
    params.set("minPrice", String(query.minPrice));
  }

  if (query.maxPrice !== undefined) {
    params.set("maxPrice", String(query.maxPrice));
  }

  if (query.availability && query.availability !== "all") {
    params.set("availability", query.availability);
  }

  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 12));

  const { apiRequest } = await import("../lib/api");

  const response = await apiRequest<
    ApiResponse<ApiProduct[]> & {
      pagination?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };
    }
  >(`/products?${params.toString()}`);

  return {
    products: response.data.map(mapProduct),
    total: response.pagination?.total ?? response.data.length,
    page: response.pagination?.page ?? query.page ?? 1,
    limit: response.pagination?.limit ?? query.limit ?? 12,
    totalPages: response.pagination?.totalPages ?? 1,
  };
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await apiRequest<ApiResponse<ApiProduct>>(
    `/products/${encodeURIComponent(slug)}`,
  );

  return mapProduct(response.data);
}
