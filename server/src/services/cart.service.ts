import mongoose from "mongoose";

import CartModel from "../models/Cart.js";
import ProductModel from "../models/product.model.js";

const MAX_CART_QUANTITY = 99;

export class CartServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CartServiceError";
    this.statusCode = statusCode;
  }
}

interface GuestCartItemInput {
  productId: string;
  quantity: number;
}

interface RejectedGuestCartItem {
  productId: string;
  reason: string;
}

function validateProductId(productId: string): void {
  if (!mongoose.isValidObjectId(productId)) {
    throw new CartServiceError("Invalid product ID.", 400);
  }
}

function validateQuantity(quantity: number): void {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CART_QUANTITY
  ) {
    throw new CartServiceError(
      `Quantity must be between 1 and ${MAX_CART_QUANTITY}.`,
    );
  }
}

async function getAvailableProduct(productId: string) {
  validateProductId(productId);

  const product = await ProductModel.findOne({
    _id: productId,
    status: "published",
  });

  if (!product) {
    throw new CartServiceError("Product not found or unavailable.", 404);
  }

  if (product.stockQuantity < 1) {
    throw new CartServiceError("This product is out of stock.", 409);
  }

  return product;
}

async function getOrCreateCart(userId: string) {
  return CartModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function populateCart(cart: any) {
  await cart.populate({
    path: "items.productId",
    select:
      "name slug brand model price compareAtPrice images condition stockQuantity status",
  });

  return cart;
}

// ============================================
// GET CUSTOMER CART
// ============================================

export async function getCustomerCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  return populateCart(cart);
}

// ============================================
// ADD PRODUCT TO CART
// ============================================

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  validateQuantity(quantity);

  const product = await getAvailableProduct(productId);
  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find(
    (item: any) => item.productId.toString() === productId,
  );

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (newQuantity > product.stockQuantity) {
    throw new CartServiceError(
      `Only ${product.stockQuantity} unit(s) are currently available.`,
      409,
    );
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
      priceAtAddition: product.price,
    });
  }

  await cart.save();

  return populateCart(cart);
}

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  validateProductId(productId);
  validateQuantity(quantity);

  const product = await getAvailableProduct(productId);

  if (quantity > product.stockQuantity) {
    throw new CartServiceError(
      `Only ${product.stockQuantity} unit(s) are currently available.`,
      409,
    );
  }

  const cart = await CartModel.findOne({ userId });

  if (!cart) {
    throw new CartServiceError("Cart not found.", 404);
  }

  const item = cart.items.find(
    (entry: any) => entry.productId.toString() === productId,
  );

  if (!item) {
    throw new CartServiceError("Product is not in your cart.", 404);
  }

  item.quantity = quantity;

  await cart.save();

  return populateCart(cart);
}

// ============================================
// REMOVE PRODUCT FROM CART
// ============================================

export async function removeCartItem(userId: string, productId: string) {
  validateProductId(productId);

  const cart = await CartModel.findOne({ userId });

  if (!cart) {
    throw new CartServiceError("Cart not found.", 404);
  }

  const initialLength = cart.items.length;

  cart.items = cart.items.filter(
    (item: any) => item.productId.toString() !== productId,
  ) as typeof cart.items;

  if (cart.items.length === initialLength) {
    throw new CartServiceError("Product is not in your cart.", 404);
  }

  await cart.save();

  return populateCart(cart);
}

// ============================================
// CLEAR CUSTOMER CART
// ============================================

export async function clearCustomerCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  cart.items = [];

  await cart.save();

  return cart;
}

// ============================================
// MERGE GUEST CART INTO CUSTOMER CART
// ============================================

export async function mergeGuestCart(
  userId: string,
  guestItems: GuestCartItemInput[],
) {
  if (!Array.isArray(guestItems) || guestItems.length > 100) {
    throw new CartServiceError("Invalid guest cart.", 400);
  }

  // Validate the complete payload before modifying the database.
  for (const item of guestItems) {
    validateProductId(item.productId);
    validateQuantity(item.quantity);
  }

  const cart = await getOrCreateCart(userId);

  const rejectedItems: RejectedGuestCartItem[] = [];

  // Combine duplicate product IDs from the guest cart.
  const combinedGuestItems = new Map<string, number>();

  for (const item of guestItems) {
    const currentQuantity = combinedGuestItems.get(item.productId) ?? 0;

    combinedGuestItems.set(item.productId, currentQuantity + item.quantity);
  }

  const productIds = [...combinedGuestItems.keys()];

  if (productIds.length === 0) {
    return {
      cart: await populateCart(cart),
      rejectedItems,
    };
  }

  // Fetch all guest products from MongoDB.
  const products = await ProductModel.find({
    _id: { $in: productIds },
    status: "published",
  });

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  // Merge each valid product into the customer's existing cart.
  for (const [productId, guestQuantity] of combinedGuestItems) {
    const product = productMap.get(productId);

    if (!product) {
      rejectedItems.push({
        productId,
        reason: "Product is unavailable or no longer published.",
      });

      continue;
    }

    if (product.stockQuantity < 1) {
      rejectedItems.push({
        productId,
        reason: "Product is currently out of stock.",
      });

      continue;
    }

    const existingItem = cart.items.find(
      (item: any) => item.productId.toString() === productId,
    );

    const existingQuantity = existingItem?.quantity ?? 0;
    const combinedQuantity = existingQuantity + guestQuantity;

    if (combinedQuantity > product.stockQuantity) {
      rejectedItems.push({
        productId,
        reason: `Only ${product.stockQuantity} unit(s) are available. Your existing cart already contains ${existingQuantity}.`,
      });

      continue;
    }

    if (combinedQuantity > MAX_CART_QUANTITY) {
      rejectedItems.push({
        productId,
        reason: `Cart quantity cannot exceed ${MAX_CART_QUANTITY}.`,
      });

      continue;
    }

    if (existingItem) {
      existingItem.quantity = combinedQuantity;

      // Preserve the original price snapshot for existing items.
    } else {
      cart.items.push({
        productId: product._id,
        quantity: guestQuantity,
        priceAtAddition: product.price,
      });
    }
  }

  await cart.save();

  return {
    cart: await populateCart(cart),
    rejectedItems,
  };
}
