import { useCartContext } from "../context/CartContext";

/**
 * Access shared cart state and actions.
 *
 * Must be called inside a component rendered under CartProvider.
 */
export function useCart() {
  return useCartContext();
}
