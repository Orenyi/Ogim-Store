import { Router } from "express";

import {
  getAdminCustomerById,
  getAdminCustomerOrders,
  getAdminCustomers,
  updateAdminCustomerStatus,
} from "../controllers/admin-customer.controller.js";

import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Every customer management endpoint requires an authenticated admin.
router.use(requireAdmin);

// GET /api/v1/admin/customers
// List customers, search, filters, statistics and pagination.
router.get("/", getAdminCustomers);

// GET /api/v1/admin/customers/:id/orders
// Customer order history.
router.get("/:id/orders", getAdminCustomerOrders);

// GET /api/v1/admin/customers/:id
// Individual customer account details.
router.get("/:id", getAdminCustomerById);

// PATCH /api/v1/admin/customers/:id/status
// Activate or disable a customer account.
router.patch("/:id/status", updateAdminCustomerStatus);

export default router;
