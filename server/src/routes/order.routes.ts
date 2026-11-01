import { Router } from "express";

import { createOrder, cancelOrder } from "../controllers/order.controller.js";

import { requireCustomerAuth } from "../middleware/customer-auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

import { createOrderSchema } from "../validators/order.validation.js";

const router = Router();

// All order endpoints require authentication.
router.use(requireCustomerAuth);

// POST /api/v1/orders
router.post("/", validateBody(createOrderSchema), createOrder);

// POST /api/v1/orders/:orderId/cancel
router.post("/:orderId/cancel", cancelOrder);

export default router;
