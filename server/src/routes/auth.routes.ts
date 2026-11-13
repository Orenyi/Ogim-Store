import { Router } from "express";

import {
  adminLogin,
  adminMe,
  deleteAccount,
  forgotPassword,
  getCsrfToken,
  googleLogin,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
} from "../controllers/auth.controller.js";

import {
  forgotPasswordRateLimit,
  loginRateLimit,
  refreshRateLimit,
  registerRateLimit,
  resetPasswordRateLimit,
} from "../middleware/auth-rate-limit.middleware.js";

import {
  requireCsrfToken,
  requireTrustedOrigin,
} from "../middleware/csrf.middleware.js";

import { requireCustomerAuth } from "../middleware/customer-auth.middleware.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// ============================================
// CSRF TOKEN
// ============================================

router.get("/csrf", requireTrustedOrigin, getCsrfToken);

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.post(
  "/admin/login",
  requireTrustedOrigin,
  requireCsrfToken,
  loginRateLimit,
  adminLogin,
);

router.get("/admin/me", requireAdmin, adminMe);

// ============================================
// CUSTOMER REGISTRATION
// ============================================

router.post(
  "/register",
  requireTrustedOrigin,
  requireCsrfToken,
  registerRateLimit,
  register,
);

// ============================================
// CUSTOMER LOGIN
// ============================================

router.post(
  "/login",
  requireTrustedOrigin,
  requireCsrfToken,
  loginRateLimit,
  login,
);

// ============================================
// GOOGLE AUTHENTICATION
// ============================================

router.post(
  "/google",
  requireTrustedOrigin,
  requireCsrfToken,
  loginRateLimit,
  googleLogin,
);

// ============================================
// PASSWORD RECOVERY
// ============================================

router.post(
  "/forgot-password",
  requireTrustedOrigin,
  requireCsrfToken,
  forgotPasswordRateLimit,
  forgotPassword,
);

router.post(
  "/reset-password",
  requireTrustedOrigin,
  requireCsrfToken,
  resetPasswordRateLimit,
  resetPassword,
);

// ============================================
// SESSION MANAGEMENT
// ============================================

router.post(
  "/refresh",
  requireTrustedOrigin,
  requireCsrfToken,
  refreshRateLimit,
  refresh,
);

router.post("/logout", requireTrustedOrigin, requireCsrfToken, logout);

// ============================================
// AUTHENTICATED CUSTOMER ROUTES
// ============================================

router.get("/me", requireCustomerAuth, me);

router.delete(
  "/account",
  requireTrustedOrigin,
  requireCsrfToken,
  requireCustomerAuth,
  deleteAccount,
);

export default router;
