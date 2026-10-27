import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types/product";
import type { CartItem, CartPriceChange, PersistedCart } from "../types/cart";
import { sampleProducts } from "../data/products";
import { useToast } from "../components/ui/ToastProvider";
import {
  calculateCartTotals,
  clampCartQuantity,
  createCartItem,
  getCartPriceChanges,
  getMaxQuantity,
} from "../utils/cartUtils";

const CART_STORAGE_KEY = "ogim-store-cart";
const CART_STORAGE_VERSION = 1;

interface CartState {
  items: CartItem[];
  dismissedPriceChanges: string[];
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "TOGGLE_ITEM"; productId: string }
  | { type: "SELECT_ALL"; selected: boolean }
  | { type: "REMOVE_SELECTED" }
  | { type: "CLEAR_CART" }
  | { type: "RESTORE_CART"; items: CartItem[] }
  | { type: "DISMISS_PRICE_CHANGE"; productId: string };

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  lineCount: number;
  selectedItemCount: number;
  selectedLineCount: number;
  subtotal: number;
  selectedSubtotal: number;
  priceChanges: CartPriceChange[];
  isAllSelected: boolean;
  isAnySelected: boolean;
  isHydrated: boolean;

  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  toggleItemSelection: (productId: string) => void;
  selectAll: (selected: boolean) => void;
  removeSelectedItems: () => void;
  clearCart: () => void;
  dismissPriceChange: (productId: string) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: [],
  dismissedPriceChanges: [],
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product.id === action.item.product.id,
      );

      if (!existing) {
        return {
          ...state,
          items: [...state.items, action.item],
          dismissedPriceChanges: state.dismissedPriceChanges.filter(
            (id) => id !== action.item.product.id,
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.item.product.id
            ? {
                ...item,
                quantity: Math.min(
                  getMaxQuantity(item.product),
                  item.quantity + action.item.quantity,
                ),
                selected: true,
              }
            : item,
        ),
        dismissedPriceChanges: state.dismissedPriceChanges.filter(
          (id) => id !== action.item.product.id,
        ),
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.productId,
        ),
        dismissedPriceChanges: state.dismissedPriceChanges.filter(
          (id) => id !== action.productId,
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      };

    case "TOGGLE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, selected: !item.selected }
            : item,
        ),
      };

    case "SELECT_ALL":
      return {
        ...state,
        items: state.items.map((item) => ({
          ...item,
          selected: action.selected,
        })),
      };

    case "REMOVE_SELECTED": {
      const removedIds = new Set(
        state.items
          .filter((item) => item.selected)
          .map((item) => item.product.id),
      );

      return {
        ...state,
        items: state.items.filter((item) => !item.selected),
        dismissedPriceChanges: state.dismissedPriceChanges.filter(
          (id) => !removedIds.has(id),
        ),
      };
    }

    case "CLEAR_CART":
      return initialState;

    case "RESTORE_CART":
      return {
        items: action.items,
        dismissedPriceChanges: [],
      };

    case "DISMISS_PRICE_CHANGE":
      return {
        ...state,
        dismissedPriceChanges: state.dismissedPriceChanges.includes(
          action.productId,
        )
          ? state.dismissedPriceChanges
          : [...state.dismissedPriceChanges, action.productId],
      };

    default:
      return state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidPersistedCart(value: unknown): value is PersistedCart {
  if (!isRecord(value) || value.version !== CART_STORAGE_VERSION) {
    return false;
  }

  if (!Array.isArray(value.items)) {
    return false;
  }

  return typeof value.updatedAt === "string";
}

/**
 * Restore only products that still exist in the current mock catalogue.
 * Current catalogue data takes precedence over stale stored product details.
 */
function restoreCartItems(value: unknown): CartItem[] {
  if (!isValidPersistedCart(value)) return [];

  const catalogue = new Map(
    sampleProducts.map((product) => [product.id, product]),
  );

  const restored = new Map<string, CartItem>();

  for (const rawItem of value.items) {
    if (!isRecord(rawItem) || !isRecord(rawItem.product)) continue;

    const productId = rawItem.product.id;

    if (typeof productId !== "string") continue;

    const product = catalogue.get(productId);

    if (!product || !product.inStock) continue;

    if (
      typeof rawItem.quantity !== "number" ||
      !Number.isInteger(rawItem.quantity) ||
      rawItem.quantity < 1
    ) {
      continue;
    }

    const quantity = clampCartQuantity(product, rawItem.quantity);

    if (quantity < 1) continue;

    const existing = restored.get(product.id);
    const combinedQuantity = Math.min(
      getMaxQuantity(product),
      (existing?.quantity ?? 0) + quantity,
    );

    if (combinedQuantity < 1) continue;

    const addedPrice =
      typeof rawItem.addedPrice === "number" &&
      Number.isFinite(rawItem.addedPrice) &&
      rawItem.addedPrice >= 0
        ? rawItem.addedPrice
        : product.price;

    restored.set(product.id, {
      product,
      quantity: combinedQuantity,
      selected: typeof rawItem.selected === "boolean" ? rawItem.selected : true,
      addedPrice: existing?.addedPrice ?? addedPrice,
    });
  }

  return [...restored.values()];
}

function readPersistedCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) return [];

    return restoreCartItems(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const toast = useToast();

  // Restore browser data once, after mounting.
  useEffect(() => {
    dispatch({
      type: "RESTORE_CART",
      items: readPersistedCart(),
    });

    setIsHydrated(true);
    setCanPersist(true);
  }, []);

  // Persist only after restoration, avoiding an initial empty-cart overwrite.
  useEffect(() => {
    if (!canPersist || typeof window === "undefined") return;

    const persistedCart: PersistedCart = {
      version: CART_STORAGE_VERSION,
      items: state.items,
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(persistedCart),
      );
    } catch {
      // The cart remains usable in memory if browser storage is unavailable.
    }
  }, [canPersist, state.items]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (!product.inStock || getMaxQuantity(product) < 1) {
        toast.warning(`${product.name} is currently unavailable.`);
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        toast.warning("Please select a valid quantity.");
        return;
      }

      const existing = state.items.find(
        (item) => item.product.id === product.id,
      );

      const requestedQuantity = (existing?.quantity ?? 0) + quantity;
      const maxQuantity = getMaxQuantity(product);

      if (requestedQuantity > maxQuantity) {
        toast.warning(`You can add up to ${maxQuantity} of ${product.name}.`);
        return;
      }

      const item = createCartItem(product, quantity);

      if (!item) {
        toast.warning(`${product.name} is currently unavailable.`);
        return;
      }

      dispatch({ type: "ADD_ITEM", item });

      toast.success(
        existing
          ? `${product.name} quantity updated in your cart.`
          : `${product.name} added to your cart.`,
      );
    },
    [state.items, toast],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === productId,
      );

      if (!item) return;

      dispatch({ type: "REMOVE_ITEM", productId });
      toast.success(`${item.product.name} removed from your cart.`);
    },
    [state.items, toast],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === productId,
      );

      if (!item) return;

      if (!Number.isInteger(quantity) || quantity < 1) {
        toast.warning("Quantity must be at least 1.");
        return;
      }

      const maxQuantity = getMaxQuantity(item.product);

      if (maxQuantity < 1) {
        toast.warning(`${item.product.name} is currently unavailable.`);
        return;
      }

      if (quantity > maxQuantity) {
        toast.warning(
          `You can add up to ${maxQuantity} of ${item.product.name}.`,
        );
        return;
      }

      if (quantity === item.quantity) return;

      dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
    },
    [state.items, toast],
  );

  const increaseQuantity = useCallback(
    (productId: string) => {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === productId,
      );

      if (item) updateQuantity(productId, item.quantity + 1);
    },
    [state.items, updateQuantity],
  );

  const decreaseQuantity = useCallback(
    (productId: string) => {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === productId,
      );

      if (item && item.quantity > 1) {
        updateQuantity(productId, item.quantity - 1);
      }
    },
    [state.items, updateQuantity],
  );

  const toggleItemSelection = useCallback((productId: string) => {
    dispatch({ type: "TOGGLE_ITEM", productId });
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    dispatch({ type: "SELECT_ALL", selected });
  }, []);

  const removeSelectedItems = useCallback(() => {
    const selectedItems = state.items.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      toast.info("Select at least one item to remove.");
      return;
    }

    dispatch({ type: "REMOVE_SELECTED" });

    toast.success(
      selectedItems.length === 1
        ? "Selected item removed from your cart."
        : `${selectedItems.length} items removed from your cart.`,
    );
  }, [state.items, toast]);

  const clearCart = useCallback(() => {
    if (state.items.length === 0) return;

    dispatch({ type: "CLEAR_CART" });
    toast.success("Your cart has been cleared.");
  }, [state.items.length, toast]);

  const dismissPriceChange = useCallback((productId: string) => {
    dispatch({ type: "DISMISS_PRICE_CHANGE", productId });
  }, []);

  const visiblePriceChanges = useMemo(
    () =>
      getCartPriceChanges(state.items).filter(
        (change) => !state.dismissedPriceChanges.includes(change.productId),
      ),
    [state.items, state.dismissedPriceChanges],
  );

  const totals = useMemo(
    () => calculateCartTotals(state.items, { deliveryFee: 0 }),
    [state.items],
  );

  const selectedTotals = useMemo(
    () =>
      calculateCartTotals(state.items, {
        selectedOnly: true,
        deliveryFee: 0,
      }),
    [state.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: totals.itemCount,
      lineCount: state.items.length,
      selectedItemCount: selectedTotals.selectedItemCount,
      selectedLineCount: state.items.filter((item) => item.selected).length,
      subtotal: totals.subtotal,
      selectedSubtotal: selectedTotals.subtotal,
      priceChanges: visiblePriceChanges,
      isAllSelected:
        state.items.length > 0 && state.items.every((item) => item.selected),
      isAnySelected: state.items.some((item) => item.selected),
      isHydrated,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      toggleItemSelection,
      selectAll,
      removeSelectedItems,
      clearCart,
      dismissPriceChange,
    }),
    [
      state.items,
      totals,
      selectedTotals,
      visiblePriceChanges,
      isHydrated,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      toggleItemSelection,
      selectAll,
      removeSelectedItems,
      clearCart,
      dismissPriceChange,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider.");
  }

  return context;
}
