import { Router } from "express";

import {
  getAdminCustomerById,
  getAdminCustomerOrders,
  getAdminCustomers,
  updateAdminCustomerStatus,
} from "../controllers/admin-customer.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

import { requireAdminPermission } from "../middleware/admin-permission.middleware.js";

const router = Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// Every customer management endpoint requires an authenticated admin.
router.use(requireAdmin);

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

// GET /api/v1/admin/customers
// List customers, search, filters, statistics and pagination.
router.get("/", requireAdminPermission("customers.view"), getAdminCustomers);

// GET /api/v1/admin/customers/:id/orders
// Customer order history.
router.get(
  "/:id/orders",
  requireAdminPermission("customers.view"),
  requireAdminPermission("orders.view"),
  getAdminCustomerOrders,
);

// GET /api/v1/admin/customers/:id
// Individual customer account details.
router.get(
  "/:id",
  requireAdminPermission("customers.view"),
  getAdminCustomerById,
);

// PATCH /api/v1/admin/customers/:id/status
// Activate or disable a customer account.
router.patch(
  "/:id/status",
  requireAdminPermission("customers.manage"),
  updateAdminCustomerStatus,
);

export default router;
