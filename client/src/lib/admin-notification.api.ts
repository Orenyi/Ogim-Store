import { apiRequest } from "./api";

// ============================================
// NOTIFICATION TYPES
// ============================================

export type AdminNotificationType =
  | "purchase_paid"
  | "staff_invited"
  | "staff_joined";

export type AdminNotificationEntityType = "order" | "staff" | "invitation";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  entityType: AdminNotificationEntityType;
  entityId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface AdminNotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetAdminNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: AdminNotification[];
    pagination: AdminNotificationPagination;
    unreadCount: number;
  };
}

export interface GetAdminUnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface MarkAdminNotificationReadResponse {
  success: boolean;
  message: string;
  data: {
    notification: AdminNotification | null;
    unreadCount: number;
  };
}

export interface MarkAllAdminNotificationsReadResponse {
  success: boolean;
  message: string;
  data: {
    modifiedCount: number;
    unreadCount: number;
  };
}

// ============================================
// GET ADMIN NOTIFICATIONS
// ============================================

export async function getAdminNotifications(
  page = 1,
  limit = 10,
  unreadOnly = false,
): Promise<GetAdminNotificationsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    unreadOnly: String(unreadOnly),
  });

  return apiRequest<GetAdminNotificationsResponse>(
    `/admin/notifications?${params.toString()}`,
  );
}

// ============================================
// GET UNREAD COUNT
// ============================================

export async function getAdminUnreadNotificationCount(): Promise<GetAdminUnreadCountResponse> {
  return apiRequest<GetAdminUnreadCountResponse>(
    "/admin/notifications/unread-count",
  );
}

// ============================================
// MARK ONE NOTIFICATION AS READ
// ============================================

export async function markAdminNotificationAsRead(
  notificationId: string,
): Promise<MarkAdminNotificationReadResponse> {
  return apiRequest<MarkAdminNotificationReadResponse>(
    `/admin/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
    },
  );
}

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

export async function markAllAdminNotificationsAsRead(): Promise<MarkAllAdminNotificationsReadResponse> {
  return apiRequest<MarkAllAdminNotificationsReadResponse>(
    "/admin/notifications/read-all",
    {
      method: "PATCH",
    },
  );
}
