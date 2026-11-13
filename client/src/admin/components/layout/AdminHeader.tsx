import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiMenu,
  FiRefreshCw,
  FiVolume2,
  FiVolumeX,
  FiX,
} from "react-icons/fi";

import ogimLogo from "../../../assets/images/ogim_logo.webp";

import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  type AdminNotification,
} from "../../../lib/admin-notification.api";

import { createAdminNotificationSocket } from "../../../lib/admin-notification.socket";

// ============================================
// TYPES
// ============================================

type AdminHeaderProps = {
  onOpenMobileMenu: () => void;
  adminName?: string;
};

interface NotificationReadEvent {
  notificationId: string;
  unreadCount: number;
}

interface NotificationsReadAllEvent {
  unreadCount: number;
  modifiedCount: number;
}

// ============================================
// CONSTANTS
// ============================================

const SOUND_STORAGE_KEY = "ogim-admin-notification-sound";
const MAX_VISIBLE_NOTIFICATIONS = 10;

// ============================================
// HELPERS
// ============================================

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

function formatNotificationDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function getNotificationLabel(type: AdminNotification["type"]): string {
  switch (type) {
    case "purchase_paid":
      return "New purchase";

    case "staff_invited":
      return "Staff invitation";

    case "staff_joined":
      return "New staff member";

    default:
      return "Notification";
  }
}

function getNotificationAccent(type: AdminNotification["type"]): string {
  switch (type) {
    case "purchase_paid":
      return "bg-orange-100 text-orange-700";

    case "staff_invited":
      return "bg-blue-100 text-blue-700";

    case "staff_joined":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getInitialSoundPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function createNotificationAudioContext(): AudioContext | null {
  try {
    const AudioContextConstructor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    return new AudioContextConstructor();
  } catch (error) {
    console.error("Unable to initialize notification audio:", error);

    return null;
  }
}

function playNotificationSound(context: AudioContext): void {
  if (context.state !== "running") {
    return;
  }

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(880, context.currentTime);

    oscillator.frequency.setValueAtTime(1174.66, context.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, context.currentTime);

    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.025);

    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.32);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  } catch (error) {
    console.error("Unable to play notification sound:", error);
  }
}

// ============================================
// COMPONENT
// ============================================

export default function AdminHeader({
  onOpenMobileMenu,
  adminName = "Admin",
}: AdminHeaderProps) {
  // ============================================
  // STATE
  // ============================================

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [notificationError, setNotificationError] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    getInitialSoundPreference,
  );

  const [markingNotificationIds, setMarkingNotificationIds] = useState<
    string[]
  >([]);

  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  // ============================================
  // REFS
  // ============================================

  const dropdownRef = useRef<HTMLDivElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const soundEnabledRef = useRef(soundEnabled);

  const notificationIdsRef = useRef<Set<string>>(new Set());

  const socketUnreadEventsRef = useRef(0);

  const socketStateVersionRef = useRef(0);

  const latestSocketUnreadCountRef = useRef<number | null>(null);

  const hasConnectedOnceRef = useRef(false);

  const isMountedRef = useRef(true);

  // ============================================
  // DERIVED VALUES
  // ============================================

  const greeting = getGreeting();

  const adminInitials =
    adminName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  // ============================================
  // KEEP SOUND REF IN SYNC
  // ============================================

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;

    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    } catch (error) {
      console.error("Unable to save notification sound preference:", error);
    }
  }, [soundEnabled]);

  // ============================================
  // COMPONENT MOUNT / UNMOUNT
  // ============================================

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => {
          // Audio context may already be closed.
        });

        audioContextRef.current = null;
      }
    };
  }, []);

  // ============================================
  // LOAD NOTIFICATIONS
  // ============================================

  const loadNotifications = useCallback(async (showRefresh = false) => {
    const unreadEventsAtStart = socketUnreadEventsRef.current;

    const socketStateVersionAtStart = socketStateVersionRef.current;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoadingNotifications(true);
      }

      setNotificationError("");

      const response = await getAdminNotifications(
        1,
        MAX_VISIBLE_NOTIFICATIONS,
        false,
      );

      if (!isMountedRef.current) {
        return;
      }

      const serverNotifications = response.data.notifications;

      const serverIds = new Set(
        serverNotifications.map((notification) => notification.id),
      );

      // Preserve notifications received through Socket.IO
      // while this API request was in progress.
      setNotifications((current) => {
        const liveNotifications = current.filter(
          (notification) => !serverIds.has(notification.id),
        );

        const merged = [...liveNotifications, ...serverNotifications];

        const uniqueNotifications = Array.from(
          new Map(
            merged.map((notification) => [notification.id, notification]),
          ).values(),
        );

        uniqueNotifications.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const latestNotifications = uniqueNotifications.slice(
          0,
          MAX_VISIBLE_NOTIFICATIONS,
        );

        notificationIdsRef.current = new Set(
          latestNotifications.map((notification) => notification.id),
        );

        return latestNotifications;
      });

      // Preserve live notification events received during
      // this request.
      const unreadEventsDuringRequest = Math.max(
        0,
        socketUnreadEventsRef.current - unreadEventsAtStart,
      );

      // If a read-state event arrived during the API request,
      // its unread count is more recent than the API response.
      if (socketStateVersionRef.current !== socketStateVersionAtStart) {
        if (latestSocketUnreadCountRef.current !== null) {
          setUnreadCount(latestSocketUnreadCountRef.current);
        } else {
          setUnreadCount(response.data.unreadCount + unreadEventsDuringRequest);
        }
      } else {
        setUnreadCount(response.data.unreadCount + unreadEventsDuringRequest);
      }

      // Events received during this request are now accounted for.
      socketUnreadEventsRef.current = Math.max(
        0,
        socketUnreadEventsRef.current - unreadEventsDuringRequest,
      );
    } catch (error: unknown) {
      if (!isMountedRef.current) {
        return;
      }

      console.error("Failed to load admin notifications:", error);

      setNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to load notifications. Please try again.",
      );
    } finally {
      if (isMountedRef.current) {
        setLoadingNotifications(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // ============================================
  // SOCKET.IO REAL-TIME NOTIFICATIONS
  // ============================================

  useEffect(() => {
    const socket = createAdminNotificationSocket();

    function handleConnect() {
      setSocketConnected(true);

      console.log("Admin notification socket connected.");

      // The initial API request already runs on mount.
      // Fetch again only when a previously connected socket
      // reconnects after losing its connection.
      if (hasConnectedOnceRef.current) {
        void loadNotifications(true);
      }

      hasConnectedOnceRef.current = true;
    }

    function handleDisconnect() {
      setSocketConnected(false);
    }

    function handleConnectionError(error: Error) {
      setSocketConnected(false);

      console.error("Admin notification socket error:", error.message);
    }

    // --------------------------------------------
    // NEW NOTIFICATION EVENT
    // --------------------------------------------

    function handleNewNotification(notification: AdminNotification) {
      if (notificationIdsRef.current.has(notification.id)) {
        return;
      }

      notificationIdsRef.current.add(notification.id);

      setNotifications((current) => {
        const updated = [
          notification,
          ...current.filter((item) => item.id !== notification.id),
        ];

        return updated.slice(0, MAX_VISIBLE_NOTIFICATIONS);
      });

      if (!notification.isRead) {
        socketUnreadEventsRef.current += 1;

        const nextUnreadCount =
          (latestSocketUnreadCountRef.current ?? unreadCount) + 1;

        latestSocketUnreadCountRef.current = nextUnreadCount;

        setUnreadCount(nextUnreadCount);
      }

      if (soundEnabledRef.current && audioContextRef.current) {
        playNotificationSound(audioContextRef.current);
      }
    }

    // --------------------------------------------
    // SINGLE NOTIFICATION READ EVENT
    // --------------------------------------------

    function handleNotificationRead(payload: NotificationReadEvent) {
      if (
        !payload ||
        typeof payload.notificationId !== "string" ||
        typeof payload.unreadCount !== "number"
      ) {
        return;
      }

      socketStateVersionRef.current += 1;

      latestSocketUnreadCountRef.current = payload.unreadCount;

      // Update the notification in every connected session.
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === payload.notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      // Use the authoritative count calculated by MongoDB.
      setUnreadCount(payload.unreadCount);
    }

    // --------------------------------------------
    // MARK ALL NOTIFICATIONS AS READ EVENT
    // --------------------------------------------

    function handleNotificationsReadAll(payload: NotificationsReadAllEvent) {
      if (
        !payload ||
        typeof payload.unreadCount !== "number" ||
        typeof payload.modifiedCount !== "number"
      ) {
        return;
      }

      socketStateVersionRef.current += 1;

      latestSocketUnreadCountRef.current = payload.unreadCount;

      // Update all visible notifications.
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(payload.unreadCount);
    }

    // --------------------------------------------
    // REGISTER SOCKET EVENTS
    // --------------------------------------------

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("connect_error", handleConnectionError);

    socket.on("admin:notification", handleNewNotification);

    socket.on("admin:notification-read", handleNotificationRead);

    socket.on("admin:notifications-read-all", handleNotificationsReadAll);

    socket.connect();

    // --------------------------------------------
    // CLEANUP
    // --------------------------------------------

    return () => {
      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      socket.off("connect_error", handleConnectionError);

      socket.off("admin:notification", handleNewNotification);

      socket.off("admin:notification-read", handleNotificationRead);

      socket.off("admin:notifications-read-all", handleNotificationsReadAll);

      socket.disconnect();
    };
  }, [loadNotifications, unreadCount]);

  // ============================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK / ESCAPE
  // ============================================

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  // ============================================
  // TOGGLE NOTIFICATION SOUND
  // ============================================

  async function handleSoundToggle() {
    if (soundEnabled) {
      setSoundEnabled(false);
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = createNotificationAudioContext();
      }

      if (audioContextRef.current) {
        await audioContextRef.current.resume();

        if (audioContextRef.current.state === "running") {
          setSoundEnabled(true);

          playNotificationSound(audioContextRef.current);
        } else {
          setNotificationError(
            "Your browser could not activate notification sound. Please check your browser audio settings.",
          );
        }
      } else {
        setNotificationError(
          "Notification sound is not supported by this browser.",
        );
      }
    } catch (error) {
      console.error("Unable to enable notification sound:", error);

      setNotificationError("Unable to enable notification sound.");
    }
  }

  // ============================================
  // MARK ONE NOTIFICATION AS READ
  // ============================================

  async function handleMarkAsRead(notificationId: string) {
    if (markingNotificationIds.includes(notificationId)) {
      return;
    }

    setMarkingNotificationIds((current) => [...current, notificationId]);

    try {
      const response = await markAdminNotificationAsRead(notificationId);

      if (!isMountedRef.current) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      // The API response and Socket.IO event both carry
      // the authoritative unread count.
      latestSocketUnreadCountRef.current = response.data.unreadCount;

      setUnreadCount(response.data.unreadCount);

      setNotificationError("");
    } catch (error: unknown) {
      console.error("Unable to mark notification as read:", error);

      setNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to update notification.",
      );
    } finally {
      if (isMountedRef.current) {
        setMarkingNotificationIds((current) =>
          current.filter((id) => id !== notificationId),
        );
      }
    }
  }

  // ============================================
  // MARK ALL NOTIFICATIONS AS READ
  // ============================================

  async function handleMarkAllAsRead() {
    if (markingAllAsRead || unreadCount === 0) {
      return;
    }

    setMarkingAllAsRead(true);

    try {
      const response = await markAllAdminNotificationsAsRead();

      if (!isMountedRef.current) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      latestSocketUnreadCountRef.current = response.data.unreadCount;

      setUnreadCount(response.data.unreadCount);

      setNotificationError("");
    } catch (error: unknown) {
      console.error("Unable to mark all notifications as read:", error);

      setNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to update notifications.",
      );
    } finally {
      if (isMountedRef.current) {
        setMarkingAllAsRead(false);
      }
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--color-border)] bg-[var(--color-paper)]/95 backdrop-blur-md">
      {/* Main header row */}
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[76px] lg:px-8">
        {/* Mobile brand and menu */}
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <FiMenu size={21} />
          </button>

          <img
            src={ogimLogo}
            alt="Ogim Store"
            className="h-8 max-w-[145px] object-contain"
          />
        </div>

        {/* Desktop greeting */}
        <div className="hidden min-w-0 lg:block">
          <h1 className="font-heading text-[25px] font-extrabold tracking-[-0.045em] text-[var(--color-ink)] xl:text-[28px]">
            {greeting}, {adminName}
          </h1>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Here's what's happening at Ogim Store today.
          </p>
        </div>

        {/* Header actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <FiBell size={19} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-[var(--color-accent)] px-1 text-[9px] font-bold leading-none text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  role="dialog"
                  aria-label="Notifications"
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 z-50 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-dropdown)]"
                >
                  {/* Dropdown header */}
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
                    <div>
                      <h3 className="font-heading text-base font-bold text-[var(--color-ink)]">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                          : "You're up to date"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Sound toggle */}
                      <button
                        type="button"
                        onClick={() => void handleSoundToggle()}
                        title={
                          soundEnabled
                            ? "Turn notification sound off"
                            : "Turn notification sound on"
                        }
                        aria-label={
                          soundEnabled
                            ? "Turn notification sound off"
                            : "Turn notification sound on"
                        }
                        aria-pressed={soundEnabled}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                      >
                        {soundEnabled ? (
                          <FiVolume2 size={16} />
                        ) : (
                          <FiVolumeX size={16} />
                        )}
                      </button>

                      {/* Refresh */}
                      <button
                        type="button"
                        onClick={() => void loadNotifications(true)}
                        disabled={refreshing}
                        title="Refresh notifications"
                        aria-label="Refresh notifications"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] disabled:opacity-50"
                      >
                        <FiRefreshCw
                          size={15}
                          className={refreshing ? "animate-spin" : ""}
                        />
                      </button>

                      {/* Close */}
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close notifications"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                      >
                        <FiX size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Notification actions */}
                  {unreadCount > 0 && !loadingNotifications && (
                    <div className="flex justify-end border-b border-[var(--color-border)] px-4 py-2">
                      <button
                        type="button"
                        onClick={() => void handleMarkAllAsRead()}
                        disabled={markingAllAsRead}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {markingAllAsRead ? (
                          <FiRefreshCw size={13} className="animate-spin" />
                        ) : (
                          <FiCheckCircle size={14} />
                        )}

                        {markingAllAsRead ? "Updating..." : "Mark all as read"}
                      </button>
                    </div>
                  )}

                  {/* Notification error */}
                  {notificationError && notifications.length > 0 && (
                    <div
                      role="alert"
                      className="border-b border-red-100 bg-red-50 px-4 py-2"
                    >
                      <p className="text-xs text-red-700">
                        {notificationError}
                      </p>
                    </div>
                  )}

                  {/* Notifications list */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="flex flex-col items-center justify-center px-4 py-12">
                        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--color-stone)] border-t-[var(--color-accent)]" />

                        <p className="mt-3 text-sm text-[var(--color-muted)]">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notificationError && notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          Unable to load notifications
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                          {notificationError}
                        </p>

                        <button
                          type="button"
                          onClick={() => void loadNotifications(true)}
                          disabled={refreshing}
                          className="mt-4 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-5 py-12 text-center">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                          <FiBell size={21} />
                        </span>

                        <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                          You're all caught up
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          New store notifications will appear here.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notification) => {
                          const isMarking = markingNotificationIds.includes(
                            notification.id,
                          );

                          return (
                            <div
                              key={notification.id}
                              className={`border-b border-[var(--color-border)] px-4 py-3.5 transition-colors last:border-b-0 ${
                                notification.isRead
                                  ? "bg-white"
                                  : "bg-orange-50/50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationAccent(notification.type)}`}
                                >
                                  {notification.type === "purchase_paid" ? (
                                    <FiCheckCircle size={17} />
                                  ) : (
                                    <FiBell size={17} />
                                  )}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-bold text-[var(--color-ink)]">
                                        {notification.title}
                                      </p>

                                      <span className="mt-1 inline-block rounded-md bg-[var(--color-stone)]/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                                        {getNotificationLabel(
                                          notification.type,
                                        )}
                                      </span>
                                    </div>

                                    {!notification.isRead && (
                                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                                    )}
                                  </div>

                                  <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                                    {notification.message}
                                  </p>

                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-[var(--color-muted)]">
                                      {formatNotificationDate(
                                        notification.createdAt,
                                      )}
                                    </span>

                                    {!notification.isRead && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleMarkAsRead(notification.id)
                                        }
                                        disabled={isMarking}
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent)] transition-colors hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {isMarking ? (
                                          <FiRefreshCw
                                            size={12}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <FiCheck size={12} />
                                        )}

                                        {isMarking
                                          ? "Updating..."
                                          : "Mark as read"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dropdown footer */}
                  <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-3">
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted)]">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          socketConnected
                            ? "bg-[var(--color-success)]"
                            : "bg-gray-400"
                        }`}
                      />

                      {socketConnected
                        ? "Live updates active"
                        : "Connecting to live updates..."}
                    </span>

                    <span className="text-[10px] font-medium text-[var(--color-muted)]">
                      Latest {MAX_VISIBLE_NOTIFICATIONS} notifications
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin avatar */}
          <button
            type="button"
            aria-label={`${adminName} profile`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white transition-transform hover:scale-105"
          >
            {adminInitials}
          </button>
        </div>
      </div>

      {/* Mobile greeting */}
      <div className="px-4 pb-4 lg:hidden sm:px-6">
        <h1 className="font-heading text-[21px] font-extrabold tracking-[-0.045em] text-[var(--color-ink)]">
          {greeting}, {adminName}
        </h1>

        <p className="mt-1 text-xs text-[var(--color-muted)] sm:text-sm">
          Here's what's happening at Ogim Store today.
        </p>
      </div>
    </header>
  );
}
