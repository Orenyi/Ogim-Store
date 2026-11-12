import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { getBrands } from "./controllers/product.controller.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

import { startOrderExpirationWorker } from "./workers/order-expiration.worker.js";

import paystackWebhookRoutes from "./routes/paystack-webhook.routes.js";
import adminCustomerRoutes from "./routes/admin-customer.routes.js";
import adminOrderRoutes from "./routes/admin-order.routes.js";
import adminDeliveryRoutes from "./routes/admin-delivery.routes.js";
import adminDispatchRoutes from "./routes/admin-dispatch.routes.js";
import adminTrackingRoutes from "./routes/admin-tracking.routes.js";
import adminRoleRoutes from "./routes/adminRole.routes.js";
import adminStaffRoutes from "./routes/adminStaff.routes.js";
import adminInvitationAcceptanceRoutes from "./routes/adminInvitationAcceptance.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminRevenueRoutes from "./routes/admin-revenue.routes.js";
import adminDashboardRoutes from "./routes/admin-dashboard.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization"],
  }),
);

// Paystack webhook must be registered before express.json().
app.use("/api/v1/payments/paystack/webhook", paystackWebhookRoutes);

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Ogim Store API is running",
  });
});

// ============================================
// CUSTOMER ROUTES
// ============================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.get("/api/v1/brands", getBrands);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/categories", categoryRoutes);

// ============================================
// ADMIN ROUTES
// ============================================

app.use("/api/v1/admin/customers", adminCustomerRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/delivery", adminDeliveryRoutes);
app.use("/api/v1/admin/dispatch", adminDispatchRoutes);
app.use("/api/v1/admin/tracking", adminTrackingRoutes);
app.use("/api/v1/admin/roles", adminRoleRoutes);
app.use("/api/v1/admin/staff", adminStaffRoutes);
app.use("/api/v1/admin/revenue", adminRevenueRoutes);
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);

// Public invitation acceptance routes.
// These routes have their own trusted-origin, CSRF and rate-limit protection.
app.use("/api/v1/admin/invitations", adminInvitationAcceptanceRoutes);

// ============================================
// START SERVER
// ============================================

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    // Start background order expiration processing.
    startOrderExpirationWorker();

    app.listen(env.PORT, () => {
      console.log(`Ogim Store API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Ogim Store:", error);
    process.exit(1);
  }
}

void startServer();
