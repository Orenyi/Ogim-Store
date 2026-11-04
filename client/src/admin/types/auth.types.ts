/**
 * Admin authentication types
 */

export type AdminRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "fulfilment"
  | "inventory"
  | "support";

export type AdminAccountStatus = "active" | "disabled" | "suspended";

export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: AdminAccountStatus;
  avatar?: string | null;
  lastLoginAt?: string | null;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  admin: AdminUser;
}

export interface AdminAuthMessageResponse {
  success: boolean;
  message: string;
}

export interface AdminSession {
  admin: AdminUser;
  authenticated: boolean;
}

export interface AdminForgotPasswordInput {
  email: string;
}

export interface AdminResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AdminAuthError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
