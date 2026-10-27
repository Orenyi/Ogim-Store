import type { Product } from "../types/product";
import type { CartItem, CartPriceChange, CartTotals } from "../types/cart";

/** Default frontend delivery estimate; replace with backend pricing later. */
export const DEFAULT_DELIVERY_FEE = 5_000;

/**
 * Temporary frontend limit when stockQuantity is not provided.
 * This is a UI safeguard, not a representation of actual inventory.
 */
export const DEFAULT_MAX_QUANTITY = 99;

/** Format an amount in Nigerian naira. */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Find a cart item by product ID. */
export function findCartItem(
  items: CartItem[],
  productId: string,
): CartItem | undefined {
  return items.find((item) => item.product.id === productId);
}

/** Return the number of units across all cart items. */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Return the number of distinct products in the cart. */
export function getCartLineCount(items: CartItem[]): number {
  return items.length;
}

/** Return the number of units belonging to selected items. */
export function getSelectedItemCount(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + (item.selected ? item.quantity : 0),
    0,
  );
}

/** Calculate the subtotal of all items or selected items only. */
export function getCartSubtotal(
  items: CartItem[],
  selectedOnly = false,
): number {
  return items.reduce((total, item) => {
    if (selectedOnly && !item.selected) return total;

    return total + item.product.price * item.quantity;
  }, 0);
}

/** Return true when every cart item is selected. */
export function areAllCartItemsSelected(items: CartItem[]): boolean {
  return items.length > 0 && items.every((item) => item.selected);
}

/** Return true when at least one cart item is selected. */
export function areAnyCartItemsSelected(items: CartItem[]): boolean {
  return items.some((item) => item.selected);
}

/** Calculate the maximum quantity allowed by the current product data. */
export function getMaxQuantity(product: Product): number {
  if (!product.inStock) return 0;

  if (product.stockQuantity !== undefined) {
    return Math.max(0, Math.floor(product.stockQuantity));
  }

  return DEFAULT_MAX_QUANTITY;
}

/** Check whether a requested quantity is valid for a product. */
export function isValidCartQuantity(
  product: Product,
  quantity: number,
): boolean {
  return (
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= getMaxQuantity(product)
  );
}

/** Clamp a quantity to the supported range. */
export function clampCartQuantity(product: Product, quantity: number): number {
  const maxQuantity = getMaxQuantity(product);

  if (maxQuantity === 0) return 0;

  return Math.min(
    maxQuantity,
    Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)),
  );
}

/** Compare cart prices with current product prices. */
export function getCartPriceChanges(items: CartItem[]): CartPriceChange[] {
  return items.flatMap((item) => {
    const previousPrice = item.addedPrice;
    const currentPrice = item.product.price;

    if (previousPrice === currentPrice) return [];

    return [
      {
        productId: item.product.id,
        productName: item.product.name,
        previousPrice,
        currentPrice,
      },
    ];
  });
}

/** Calculate totals for the entire cart or selected items. */
export function calculateCartTotals(
  items: CartItem[],
  options: {
    selectedOnly?: boolean;
    deliveryFee?: number;
    discount?: number;
  } = {},
): CartTotals {
  const {
    selectedOnly = false,
    deliveryFee = DEFAULT_DELIVERY_FEE,
    discount = 0,
  } = options;

  const relevantItems = selectedOnly
    ? items.filter((item) => item.selected)
    : items;

  const subtotal = getCartSubtotal(relevantItems);
  const safeDiscount = Math.min(
    subtotal,
    Math.max(0, Number.isFinite(discount) ? discount : 0),
  );

  const safeDeliveryFee =
    subtotal > 0
      ? Math.max(0, Number.isFinite(deliveryFee) ? deliveryFee : 0)
      : 0;

  return {
    itemCount: getCartItemCount(items),
    selectedItemCount: getSelectedItemCount(items),
    subtotal,
    deliveryFee: safeDeliveryFee,
    discount: safeDiscount,
    total: subtotal - safeDiscount + safeDeliveryFee,
  };
}

/** Create a new cart item from an existing product. */
export function createCartItem(
  product: Product,
  quantity = 1,
): CartItem | null {
  const safeQuantity = clampCartQuantity(product, quantity);

  if (safeQuantity === 0) return null;

  return {
    product,
    quantity: safeQuantity,
    selected: true,
    addedPrice: product.price,
  };
}
