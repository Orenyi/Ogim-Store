import type { Product } from "./product";

/**
 * A product stored in the customer's cart.
 * Product details are populated from the backend or mapped
 * from the guest cart's local product data.
 */
export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;

  /** Server-generated price snapshot when added to the cart. */
  addedPrice: number;
}

/** Describes a product whose current price differs from its cart price. */
export interface CartPriceChange {
  productId: string;
  productName: string;
  previousPrice: number;
  currentPrice: number;
}

/** Frontend representation of a promo-code result. */
export interface CartPromoCode {
  code: string;
  discountAmount: number;
  message?: string;
}

/** Calculated cart amounts, in Nigerian naira. */
export interface CartTotals {
  itemCount: number;
  selectedItemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

/** Guest cart persisted in the browser. */
export interface PersistedCart {
  version: 1;
  items: CartItem[];
  updatedAt: string;
}

/** Data sent to the backend when merging a guest cart. */
export interface GuestCartItemPayload {
  productId: string;
  quantity: number;
}

/** Guest cart synchronization payload. */
export interface GuestCartSyncPayload {
  items: GuestCartItemPayload[];
}
