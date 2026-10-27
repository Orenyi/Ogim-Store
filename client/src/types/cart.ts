import type { Product } from "./product";

/**
 * A product stored in the customer's cart.
 * The product itself reuses the existing Product interface.
 */
export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
  /** Price when the item was added, used for price-change alerts. */
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

/** Data saved locally to restore the cart after a page refresh. */
export interface PersistedCart {
  version: 1;
  items: CartItem[];
  updatedAt: string;
}
