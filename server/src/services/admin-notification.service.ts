import { Types } from "mongoose";

import AdminNotification, {
  ADMIN_NOTIFICATION_TYPES,
} from "../models/AdminNotification.js";

import AdminRole from "../models/AdminRole.js";

import User from "../models/User.js";

import {
  getAdminSocket,
  type AdminNotificationPayload,
} from "../socket/admin.socket.js";

// ============================================
// TYPES
// ============================================

type AdminNotificationType = (typeof ADMIN_NOTIFICATION_TYPES)[number];

type NotificationEntityType = "order" | "staff" | "invitation";

type NotificationPermission =
  | "notifications.purchases.view"
  | "notifications.staff.view";

interface CreateNotificationInput {
  recipientId: Types.ObjectId;
  actorId?: Types.ObjectId | null;
  actorName?: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId?: Types.ObjectId | null;
  eventKey: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePurchasePaidNotificationInput {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentReference: string;
}

export interface CreateStaffInvitedNotificationInput {
  invitationId: string;
  invitedBy: string;
  inviteeName: string;
  inviteeEmail: string;
  roleName: string;
}

export interface CreateStaffJoinedNotificationInput {
  invitationId: string;
  invitedBy: string;
  joinedUserId: string;
  joinedName: string;
  joinedEmail: string;
  roleName: string;
}

export interface GetAdminNotificationsOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// ============================================
// ERRORS
// ============================================

export class AdminNotificationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminNotificationError";
    this.statusCode = statusCode;
  }
}

// ============================================
// HELPERS
// ============================================

function validateAdminId(adminId: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(adminId)) {
    throw new AdminNotificationError("Invalid administrator ID.", 400);
  }

  return new Types.ObjectId(adminId);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function getPermissionForNotification(
  type: AdminNotificationType,
): NotificationPermission {
  switch (type) {
    case "purchase_paid":
      return "notifications.purchases.view";

    case "staff_invited":
    case "staff_joined":
      return "notifications.staff.view";
  }
}

function toNotificationPayload(notification: {
  _id: Types.ObjectId;
  type: AdminNotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId?: Types.ObjectId | null;
  metadata?: unknown;
  isRead: boolean;
  createdAt: Date;
}): AdminNotificationPayload {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId ? notification.entityId.toString() : null,
    metadata:
      notification.metadata && typeof notification.metadata === "object"
        ? (notification.metadata as Record<string, unknown>)
        : {},
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}

/**
 * Broadcast a single notification read-state change
 * to every connected session belonging to an administrator.
 *
 * Socket.IO is supplementary. A delivery failure must
 * never undo a successful MongoDB update.
 */
function broadcastNotificationRead(
  adminId: string,
  notificationId: string,
  unreadCount: number,
): void {
  try {
    getAdminSocket().to(`admin:${adminId}`).emit("admin:notification-read", {
      notificationId,
      unreadCount,
    });
  } catch (error: unknown) {
    console.error(
      "[Admin Notifications] Failed to broadcast notification read event:",
      error,
    );
  }
}

/**
 * Broadcast a read-all change to every connected
 * session belonging to an administrator.
 */
function broadcastNotificationsReadAll(
  adminId: string,
  unreadCount: number,
  modifiedCount: number,
): void {
  try {
    getAdminSocket()
      .to(`admin:${adminId}`)
      .emit("admin:notifications-read-all", {
        unreadCount,
        modifiedCount,
      });
  } catch (error: unknown) {
    console.error(
      "[Admin Notifications] Failed to broadcast read-all event:",
      error,
    );
  }
}

// ============================================
// RECIPIENT RESOLUTION
// ============================================

/**
 * Super Admin always receives notifications.
 *
 * Active staff administrators receive notifications
 * only when their assigned role contains the
 * corresponding notification permission.
 *
 * Disabled and deleted administrators are excluded.
 */
async function getNotificationRecipients(
  type: AdminNotificationType,
): Promise<Types.ObjectId[]> {
  const requiredPermission = getPermissionForNotification(type);

  const administrators = await User.find({
    role: "admin",
    status: "active",
    deletedAt: null,
  })
    .select("_id adminType adminRoleId")
    .lean();

  const superAdmins = administrators.filter(
    (admin) => admin.adminType === "super_admin",
  );

  const staffAdmins = administrators.filter(
    (admin) => admin.adminType === "staff" && admin.adminRoleId,
  );

  const roleIds = [
    ...new Set(staffAdmins.map((admin) => admin.adminRoleId!.toString())),
  ];

  const roles = roleIds.length
    ? await AdminRole.find({
        _id: {
          $in: roleIds,
        },
      })
        .select("_id permissions")
        .lean()
    : [];

  const rolePermissionMap = new Map<string, string[]>(
    roles.map((role) => [role._id.toString(), role.permissions ?? []]),
  );

  const authorizedStaff = staffAdmins.filter((admin) => {
    const roleId = admin.adminRoleId?.toString();

    if (!roleId) {
      return false;
    }

    return rolePermissionMap.get(roleId)?.includes(requiredPermission) ?? false;
  });

  return [
    ...superAdmins.map((admin) => admin._id),
    ...authorizedStaff.map((admin) => admin._id),
  ];
}

// ============================================
// CREATE ONE RECIPIENT NOTIFICATION
// ============================================

async function createRecipientNotification(
  input: CreateNotificationInput,
): Promise<AdminNotificationPayload | null> {
  try {
    const notification = await AdminNotification.create({
      recipientId: input.recipientId,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? "Ogim Store",
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      eventKey: input.eventKey,
      metadata: input.metadata ?? {},
      isRead: false,
      readAt: null,
    });

    const payload = toNotificationPayload(notification);

    // MongoDB is the permanent notification record.
    // Socket.IO provides supplementary real-time delivery.
    try {
      getAdminSocket()
        .to(`admin:${input.recipientId.toString()}`)
        .emit("admin:notification", payload);
    } catch (socketError: unknown) {
      console.error(
        "Notification was saved, but real-time delivery failed:",
        socketError,
      );
    }

    return payload;
  } catch (error: unknown) {
    // Ignore duplicate event delivery for this recipient.
    if (isDuplicateKeyError(error)) {
      return null;
    }

    throw error;
  }
}

// ============================================
// CREATE NOTIFICATIONS FOR RECIPIENTS
// ============================================

async function createNotificationsForRecipients(
  input: Omit<CreateNotificationInput, "recipientId">,
): Promise<AdminNotificationPayload[]> {
  const recipients = await getNotificationRecipients(input.type);

  if (recipients.length === 0) {
    return [];
  }

  const createdNotifications: AdminNotificationPayload[] = [];

  for (const recipientId of recipients) {
    const notification = await createRecipientNotification({
      ...input,
      recipientId,
    });

    if (notification) {
      createdNotifications.push(notification);
    }
  }

  return createdNotifications;
}

// ============================================
// PURCHASE PAID NOTIFICATION
// ============================================

/**
 * Call only after the canonical order payment
 * has been successfully verified and committed.
 */
export async function createPurchasePaidNotifications(
  input: CreatePurchasePaidNotificationInput,
): Promise<AdminNotificationPayload[]> {
  if (
    !Types.ObjectId.isValid(input.paymentId) ||
    !Types.ObjectId.isValid(input.orderId)
  ) {
    throw new AdminNotificationError("Invalid payment or order ID.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new AdminNotificationError("Invalid purchase amount.");
  }

  const eventKey = `purchase_paid:${input.paymentId}`;

  return createNotificationsForRecipients({
    type: "purchase_paid",
    title: "New purchase received",
    message: `${input.customerName} successfully paid for order ${input.orderNumber}.`,
    entityType: "order",
    entityId: new Types.ObjectId(input.orderId),
    eventKey,
    actorId: null,
    actorName: "Ogim Store",
    metadata: {
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      amount: input.amount,
      currency: input.currency,
      paymentReference: input.paymentReference,
      paymentId: input.paymentId,
    },
  });
}

// ============================================
// STAFF INVITATION NOTIFICATION
// ============================================

/**
 * Notify authorized administrators after a staff
 * invitation has been successfully sent.
 */
export async function createStaffInvitedNotifications(
  input: CreateStaffInvitedNotificationInput,
): Promise<AdminNotificationPayload[]> {
  if (
    !Types.ObjectId.isValid(input.invitationId) ||
    !Types.ObjectId.isValid(input.invitedBy)
  ) {
    throw new AdminNotificationError("Invalid invitation or administrator ID.");
  }

  const inviter = await User.findOne({
    _id: input.invitedBy,
    role: "admin",
  })
    .select("fullName")
    .lean();

  const inviterName = inviter?.fullName ?? "An administrator";

  return createNotificationsForRecipients({
    type: "staff_invited",
    title: "New staff invitation",
    message: `${inviterName} invited ${input.inviteeName} as ${input.roleName}.`,
    entityType: "invitation",
    entityId: new Types.ObjectId(input.invitationId),
    eventKey: `staff_invited:${input.invitationId}`,
    actorId: new Types.ObjectId(input.invitedBy),
    actorName: inviterName,
    metadata: {
      inviterName,
      inviteeName: input.inviteeName,
      inviteeEmail: input.inviteeEmail,
      roleName: input.roleName,
      invitationId: input.invitationId,
    },
  });
}

// ============================================
// STAFF JOINED NOTIFICATION
// ============================================

/**
 * Notify authorized administrators after an invited
 * staff member successfully creates their account.
 */
export async function createStaffJoinedNotifications(
  input: CreateStaffJoinedNotificationInput,
): Promise<AdminNotificationPayload[]> {
  if (
    !Types.ObjectId.isValid(input.invitationId) ||
    !Types.ObjectId.isValid(input.invitedBy) ||
    !Types.ObjectId.isValid(input.joinedUserId)
  ) {
    throw new AdminNotificationError("Invalid staff invitation or account ID.");
  }

  const inviter = await User.findOne({
    _id: input.invitedBy,
    role: "admin",
  })
    .select("fullName")
    .lean();

  const inviterName = inviter?.fullName ?? "An administrator";

  return createNotificationsForRecipients({
    type: "staff_joined",
    title: "New staff member joined",
    message: `${input.joinedName} accepted an invitation from ${inviterName} and joined as ${input.roleName}.`,
    entityType: "staff",
    entityId: new Types.ObjectId(input.joinedUserId),
    eventKey: `staff_joined:${input.invitationId}`,
    actorId: new Types.ObjectId(input.joinedUserId),
    actorName: input.joinedName,
    metadata: {
      inviterName,
      inviterId: input.invitedBy,
      joinedName: input.joinedName,
      joinedEmail: input.joinedEmail,
      joinedUserId: input.joinedUserId,
      roleName: input.roleName,
      invitationId: input.invitationId,
    },
  });
}

// ============================================
// GET ADMIN NOTIFICATIONS
// ============================================

export async function getAdminNotifications(
  adminId: string,
  options: GetAdminNotificationsOptions = {},
) {
  const recipientId = validateAdminId(adminId);

  const page = Math.max(1, Math.floor(options.page ?? 1));
  const limit = Math.min(50, Math.max(1, Math.floor(options.limit ?? 20)));

  const filter: Record<string, unknown> = {
    recipientId,
  };

  if (options.unreadOnly) {
    filter.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    AdminNotification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    AdminNotification.countDocuments(filter),

    AdminNotification.countDocuments({
      recipientId,
      isRead: false,
    }),
  ]);

  return {
    notifications: notifications.map((notification) =>
      toNotificationPayload(notification),
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
    unreadCount,
  };
}

// ============================================
// GET UNREAD NOTIFICATION COUNT
// ============================================

export async function getAdminUnreadNotificationCount(
  adminId: string,
): Promise<number> {
  const recipientId = validateAdminId(adminId);

  return AdminNotification.countDocuments({
    recipientId,
    isRead: false,
  });
}

// ============================================
// MARK ONE NOTIFICATION AS READ
// ============================================

export async function markAdminNotificationAsRead(
  adminId: string,
  notificationId: string,
) {
  const recipientId = validateAdminId(adminId);

  if (!Types.ObjectId.isValid(notificationId)) {
    throw new AdminNotificationError("Invalid notification ID.");
  }

  // Only an unread notification can be updated.
  // This prevents multiple sessions from processing
  // the same unread notification more than once.
  const notification = await AdminNotification.findOneAndUpdate(
    {
      _id: notificationId,
      recipientId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
    },
  ).lean();

  if (!notification) {
    const existingNotification = await AdminNotification.exists({
      _id: notificationId,
      recipientId,
    });

    if (!existingNotification) {
      throw new AdminNotificationError("Notification could not be found.", 404);
    }

    return {
      notification: null,
      message: "Notification has already been read.",
      unreadCount: await getAdminUnreadNotificationCount(adminId),
    };
  }

  // Calculate the authoritative unread count after
  // the successful MongoDB update.
  const unreadCount = await getAdminUnreadNotificationCount(adminId);

  // Synchronize every connected browser session.
  broadcastNotificationRead(adminId, notification._id.toString(), unreadCount);

  return {
    notification: toNotificationPayload(notification),
    message: "Notification marked as read.",
    unreadCount,
  };
}

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

export async function markAllAdminNotificationsAsRead(adminId: string) {
  const recipientId = validateAdminId(adminId);
  const now = new Date();

  // Update only notifications that are currently unread.
  const result = await AdminNotification.updateMany(
    {
      recipientId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    },
  );

  // Get the authoritative unread count after the update.
  const unreadCount = await getAdminUnreadNotificationCount(adminId);

  // Broadcast the read-all event to every connected session.
  if (result.modifiedCount > 0) {
    broadcastNotificationsReadAll(adminId, unreadCount, result.modifiedCount);
  }

  return {
    modifiedCount: result.modifiedCount,
    unreadCount,
    message: "All notifications marked as read.",
  };
}
