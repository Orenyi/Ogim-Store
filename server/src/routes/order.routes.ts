import { Router } from "express";

import {
  createOrder,
  cancelOrder,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";

import { initializePayment } from "../controllers/payment.controller.js";

import { verifyPayment } from "../controllers/payment-verification.controller.js";

import { requireCustomerAuth } from "../middleware/customer-auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

import { createOrderSchema } from "../validators/order.validation.js";

const router = Router();

// ============================================
// AUTHENTICATION
// All order endpoints require customer authentication.
// ============================================

router.use(requireCustomerAuth);

// ============================================
// GET CUSTOMER ORDERS
// GET /api/v1/orders
// ============================================

router.get("/", getOrders);

// ============================================
// GET SINGLE CUSTOMER ORDER
// GET /api/v1/orders/:orderId
// ============================================

router.get("/:orderId", getOrderById);

// ============================================
// CREATE PENDING ORDER
// POST /api/v1/orders
// ============================================

router.post("/", validateBody(createOrderSchema), createOrder);

// ============================================
// INITIALIZE ORDER PAYMENT
// POST /api/v1/orders/:orderId/pay
// ============================================

router.post("/:orderId/pay", initializePayment);

// ============================================
// VERIFY ORDER PAYMENT
// POST /api/v1/orders/:orderId/verify-payment
// ============================================

router.post("/:orderId/verify-payment", verifyPayment);

// ============================================
// CANCEL PENDING ORDER
// POST /api/v1/orders/:orderId/cancel
// ============================================

router.post("/:orderId/cancel", cancelOrder);

export default router;
