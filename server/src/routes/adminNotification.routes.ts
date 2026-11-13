import { Router } from "express";

import { requireAdmin } from "../middleware/auth.middleware.js";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/adminNotification.controller.js";

const router = Router();

// All notification endpoints require an authenticated, active admin.
router.use(requireAdmin);

// Retrieve notifications.
router.get("/", getNotifications);

// Retrieve unread count.
router.get("/unread-count", getUnreadNotificationCount);

// Mark all notifications as read.
// Keep this route before the parameterized notification route.
router.patch("/read-all", markAllNotificationsAsRead);

// Mark one notification as read.
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;
