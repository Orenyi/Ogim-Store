import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../types/product";
import type { CartItem, CartPriceChange, PersistedCart } from "../types/cart";

import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "./AuthContext";

import {
  ApiError,
  addCartItem as addCartItemApi,
  clearCart as clearCartApi,
  getCart as getCartApi,
  mergeGuestCart as mergeGuestCartApi,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
  type CartApiData,
  type CartApiProduct,
} from "../lib/api";

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

// ============================================
// CART REDUCER
// ============================================

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

// ============================================
// VALIDATION HELPERS
// ============================================

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

function isValidStoredProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.price === "number" &&
    typeof value.brand === "string" &&
    typeof value.condition === "string" &&
    typeof value.image === "string"
  );
}

/**
 * Guest cart product information is only a local display cache.
 * The backend validates product availability and current stock
 * when the customer signs in.
 */
function restoreCartItems(value: unknown): CartItem[] {
  if (!isValidPersistedCart(value)) return [];

  const restored = new Map<string, CartItem>();

  for (const rawItem of value.items) {
    if (!isRecord(rawItem)) continue;

    if (!isValidStoredProduct(rawItem.product)) continue;

    const product = rawItem.product;

    if (
      typeof rawItem.quantity !== "number" ||
      !Number.isInteger(rawItem.quantity) ||
      rawItem.quantity < 1
    ) {
      continue;
    }

    if (rawItem.addedPrice !== undefined) {
      if (
        typeof rawItem.addedPrice !== "number" ||
        !Number.isFinite(rawItem.addedPrice) ||
        rawItem.addedPrice < 0
      ) {
        continue;
      }
    }

    const quantity = clampCartQuantity(product, rawItem.quantity);

    if (quantity < 1) continue;

    const existing = restored.get(product.id);

    const combinedQuantity = Math.min(
      getMaxQuantity(product),
      (existing?.quantity ?? 0) + quantity,
    );

    if (combinedQuantity < 1) continue;

    restored.set(product.id, {
      product,
      quantity: combinedQuantity,
      selected: typeof rawItem.selected === "boolean" ? rawItem.selected : true,
      addedPrice:
        existing?.addedPrice ??
        (typeof rawItem.addedPrice === "number"
          ? rawItem.addedPrice
          : product.price),
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

function writePersistedCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  const persistedCart: PersistedCart = {
    version: CART_STORAGE_VERSION,
    items,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(persistedCart),
    );
  } catch {
    // The cart remains usable in memory if storage is unavailable.
  }
}

function clearPersistedCart(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore unavailable browser storage.
  }
}

// ============================================
// BACKEND PRODUCT MAPPING
// ============================================

/**
 * Converts the backend Product structure into the frontend Product type.
 *
 * Backend:
 * condition: brand-new | uk-used | refurbished
 *
 * Frontend:
 * condition: new | uk-used | refurbished
 */
function mapBackendProduct(apiProduct: CartApiProduct): Product {
  const firstImage = apiProduct.images?.[0]?.url ?? "";

  const condition: Product["condition"] =
    apiProduct.condition === "brand-new" ? "new" : apiProduct.condition;

  return {
    id: apiProduct._id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    model: apiProduct.model,
    description: apiProduct.description,
    brand: apiProduct.brand as Product["brand"],
    condition,
    price: apiProduct.price,
    compareAtPrice: apiProduct.compareAtPrice,
    storage: apiProduct.specifications?.storage ?? "",
    colour: apiProduct.specifications?.color ?? "",
    image: firstImage,
    images: apiProduct.images?.map((image) => image.url) ?? [],
    specifications: apiProduct.specifications,
    inStock: apiProduct.stockQuantity > 0,
    stockQuantity: apiProduct.stockQuantity,
  };
}

/**
 * Converts the populated MongoDB cart into the existing frontend CartItem type.
 *
 * Selection is maintained locally because selection is a UI concern,
 * not something that needs to be stored in MongoDB.
 */
function mapBackendCart(
  cart: CartApiData,
  previousItems: CartItem[] = [],
): CartItem[] {
  const previousSelection = new Map(
    previousItems.map((item) => [item.product.id, item.selected]),
  );

  return cart.items
    .filter(
      (item) => typeof item.productId === "object" && item.productId !== null,
    )
    .map((item) => {
      const product = mapBackendProduct(item.productId);

      return {
        product,
        quantity: item.quantity,
        selected: previousSelection.get(product.id) ?? true,
        addedPrice: item.priceAtAddition,
      };
    });
}

// ============================================
// PROVIDER
// ============================================

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const [isHydrated, setIsHydrated] = useState(false);
  const [hasRestoredGuestCart, setHasRestoredGuestCart] = useState(false);

  const toast = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const lastSyncedUserId = useRef<string | null>(null);
  const syncInProgress = useRef(false);

  const isAuthenticated = Boolean(user);

  // ============================================
  // RESTORE GUEST CART
  // ============================================

  useEffect(() => {
    dispatch({
      type: "RESTORE_CART",
      items: readPersistedCart(),
    });

    setHasRestoredGuestCart(true);
  }, []);

  // ============================================
  // GUEST CART PERSISTENCE
  // ============================================

  useEffect(() => {
    if (!hasRestoredGuestCart || !isHydrated || isAuthenticated) {
      return;
    }

    writePersistedCart(state.items);
  }, [state.items, hasRestoredGuestCart, isHydrated, isAuthenticated]);

  // ============================================
  // AUTHENTICATION AND CART SYNCHRONIZATION
  // ============================================

  useEffect(() => {
    if (isAuthLoading || !hasRestoredGuestCart) return;

    let cancelled = false;

    async function synchronizeCart() {
      if (syncInProgress.current) return;

      const currentUserId = user?.id ?? null;

      // Already synchronized for this authentication state.
      if (lastSyncedUserId.current === currentUserId && isHydrated) {
        return;
      }

      syncInProgress.current = true;

      try {
        if (!currentUserId) {
          // A customer logged out. Do not carry their private cart
          // into the next guest session.
          if (lastSyncedUserId.current !== null) {
            dispatch({
              type: "RESTORE_CART",
              items: [],
            });

            clearPersistedCart();
          }

          lastSyncedUserId.current = null;

          if (!cancelled) {
            setIsHydrated(true);
          }

          return;
        }

        const guestItems = readPersistedCart();

        let serverCart: CartApiData;

        if (guestItems.length > 0) {
          // Merge the guest cart into the authenticated cart.
          const mergeResponse = await mergeGuestCartApi({
            items: guestItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          });

          serverCart = mergeResponse.data;

          clearPersistedCart();

          if (mergeResponse.rejectedItems?.length > 0) {
            const rejectedCount = mergeResponse.rejectedItems.length;

            toast.warning(
              rejectedCount === 1
                ? "One item could not be added because it is unavailable or exceeds available stock."
                : `${rejectedCount} items could not be added because they are unavailable or exceed available stock.`,
            );
          } else {
            toast.success("Your cart has been synchronized.");
          }
        } else {
          // No guest items. Fetch the existing customer cart.
          const response = await getCartApi();

          serverCart = response.data;
        }

        if (cancelled) return;

        dispatch({
          type: "RESTORE_CART",
          items: mapBackendCart(serverCart, state.items),
        });

        lastSyncedUserId.current = currentUserId;

        setIsHydrated(true);
      } catch (error) {
        if (cancelled) return;

        console.error("Cart synchronization failed:", error);

        if (error instanceof ApiError && error.status === 401) {
          toast.warning("Your session has expired. Please sign in again.");
        } else {
          toast.error("Unable to synchronize your cart. Please try again.");
        }

        // Do not mark the user as synchronized after a failed request.
        setIsHydrated(true);
      } finally {
        syncInProgress.current = false;
      }
    }

    void synchronizeCart();

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    isAuthLoading,
    hasRestoredGuestCart,
    isHydrated,
    state.items,
    toast,
  ]);

  // ============================================
  // SERVER CART REFRESH
  // ============================================

  const refreshServerCart = useCallback(async () => {
    const response = await getCartApi();

    dispatch({
      type: "RESTORE_CART",
      items: mapBackendCart(response.data, state.items),
    });
  }, [state.items]);

  // ============================================
  // ADD TO CART
  // ============================================

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

      // Guest cart: update local state.
      if (!isAuthenticated) {
        dispatch({
          type: "ADD_ITEM",
          item,
        });

        toast.success(
          existing
            ? `${product.name} quantity updated in your cart.`
            : `${product.name} added to your cart.`,
        );

        return;
      }

      // Authenticated cart: update MongoDB.
      void (async () => {
        try {
          const response = await addCartItemApi({
            productId: product.id,
            quantity,
          });

          dispatch({
            type: "RESTORE_CART",
            items: mapBackendCart(response.data, state.items),
          });

          toast.success(
            existing
              ? `${product.name} quantity updated in your cart.`
              : `${product.name} added to your cart.`,
          );
        } catch (error) {
          console.error("Unable to add cart item:", error);

          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to add this product to your cart.",
          );
        }
      })();
    },
    [state.items, isAuthenticated, toast],
  );

  // ============================================
  // REMOVE FROM CART
  // ============================================

  const removeFromCart = useCallback(
    (productId: string) => {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === productId,
      );

      if (!item) return;

      if (!isAuthenticated) {
        dispatch({
          type: "REMOVE_ITEM",
          productId,
        });

        toast.success(`${item.product.name} removed from your cart.`);
        return;
      }

      void (async () => {
        try {
          const response = await removeCartItemApi(productId);

          dispatch({
            type: "RESTORE_CART",
            items: mapBackendCart(response.data, state.items),
          });

          toast.success(`${item.product.name} removed from your cart.`);
        } catch (error) {
          console.error("Unable to remove cart item:", error);

          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to remove this product.",
          );
        }
      })();
    },
    [state.items, isAuthenticated, toast],
  );

  // ============================================
  // UPDATE QUANTITY
  // ============================================

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

      if (!isAuthenticated) {
        dispatch({
          type: "UPDATE_QUANTITY",
          productId,
          quantity,
        });

        return;
      }

      void (async () => {
        try {
          const response = await updateCartItemApi(productId, {
            quantity,
          });

          dispatch({
            type: "RESTORE_CART",
            items: mapBackendCart(response.data, state.items),
          });
        } catch (error) {
          console.error("Unable to update cart quantity:", error);

          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to update the product quantity.",
          );
        }
      })();
    },
    [state.items, isAuthenticated, toast],
  );

  // ============================================
  // INCREASE QUANTITY
  // ============================================

  const increaseQuantity = useCallback(
    (productId: string) => {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === productId,
      );

      if (item) {
        updateQuantity(productId, item.quantity + 1);
      }
    },
    [state.items, updateQuantity],
  );

  // ============================================
  // DECREASE QUANTITY
  // ============================================

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

  // ============================================
  // ITEM SELECTION
  // ============================================

  const toggleItemSelection = useCallback((productId: string) => {
    dispatch({
      type: "TOGGLE_ITEM",
      productId,
    });
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    dispatch({
      type: "SELECT_ALL",
      selected,
    });
  }, []);

  // ============================================
  // REMOVE SELECTED ITEMS
  // ============================================

  const removeSelectedItems = useCallback(() => {
    const selectedItems = state.items.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      toast.info("Select at least one item to remove.");
      return;
    }

    if (!isAuthenticated) {
      dispatch({
        type: "REMOVE_SELECTED",
      });

      toast.success(
        selectedItems.length === 1
          ? "Selected item removed from your cart."
          : `${selectedItems.length} items removed from your cart.`,
      );

      return;
    }

    void (async () => {
      try {
        await Promise.all(
          selectedItems.map((item) => removeCartItemApi(item.product.id)),
        );

        await refreshServerCart();

        toast.success(
          selectedItems.length === 1
            ? "Selected item removed from your cart."
            : `${selectedItems.length} items removed from your cart.`,
        );
      } catch (error) {
        console.error("Unable to remove selected cart items:", error);

        toast.error(
          "Unable to remove all selected items. Please refresh your cart.",
        );

        try {
          await refreshServerCart();
        } catch {
          // Keep the current state if refreshing also fails.
        }
      }
    })();
  }, [state.items, isAuthenticated, refreshServerCart, toast]);

  // ============================================
  // CLEAR CART
  // ============================================

  const clearCart = useCallback(() => {
    if (state.items.length === 0) return;

    if (!isAuthenticated) {
      dispatch({
        type: "CLEAR_CART",
      });

      toast.success("Your cart has been cleared.");
      return;
    }

    void (async () => {
      try {
        await clearCartApi();

        dispatch({
          type: "CLEAR_CART",
        });

        toast.success("Your cart has been cleared.");
      } catch (error) {
        console.error("Unable to clear cart:", error);

        toast.error(
          error instanceof Error ? error.message : "Unable to clear your cart.",
        );
      }
    })();
  }, [state.items.length, isAuthenticated, toast]);

  // ============================================
  // DISMISS PRICE CHANGE
  // ============================================

  const dismissPriceChange = useCallback((productId: string) => {
    dispatch({
      type: "DISMISS_PRICE_CHANGE",
      productId,
    });
  }, []);

  // ============================================
  // PRICE CHANGES
  // ============================================

  const visiblePriceChanges = useMemo(
    () =>
      getCartPriceChanges(state.items).filter(
        (change) => !state.dismissedPriceChanges.includes(change.productId),
      ),
    [state.items, state.dismissedPriceChanges],
  );

  // ============================================
  // CART TOTALS
  // ============================================

  const totals = useMemo(
    () =>
      calculateCartTotals(state.items, {
        deliveryFee: 0,
      }),
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

  // ============================================
  // CONTEXT VALUE
  // ============================================

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

// ============================================
// CART HOOK
// ============================================

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider.");
  }

  return context;
}
