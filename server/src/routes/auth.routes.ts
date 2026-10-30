import { Router } from "express";

import {
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

const router = Router();

router.get("/csrf", getCsrfToken);

// Registration
router.post(
  "/register",
  requireTrustedOrigin,
  requireCsrfToken,
  registerRateLimit,
  register,
);

// Login
router.post(
  "/login",
  requireTrustedOrigin,
  requireCsrfToken,
  loginRateLimit,
  login,
);

// Google authentication
router.post(
  "/google",
  requireTrustedOrigin,
  requireCsrfToken,
  loginRateLimit,
  googleLogin,
);

// Forgot password
router.post(
  "/forgot-password",
  requireTrustedOrigin,
  requireCsrfToken,
  forgotPasswordRateLimit,
  forgotPassword,
);

// Reset password
router.post(
  "/reset-password",
  requireTrustedOrigin,
  requireCsrfToken,
  resetPasswordRateLimit,
  resetPassword,
);

// Refresh session
router.post(
  "/refresh",
  requireTrustedOrigin,
  requireCsrfToken,
  refreshRateLimit,
  refresh,
);

// Current authenticated customer
router.get("/me", requireCustomerAuth, me);

// Logout
router.post("/logout", requireTrustedOrigin, requireCsrfToken, logout);

export default router;
