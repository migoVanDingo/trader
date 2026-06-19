// Thin wrapper over the browser Notifications API. Alerts also surface as in-app
// toasts, so a denied/absent permission degrades gracefully.

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission():
  | NotificationPermission
  | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Ask for permission if not already decided. Returns true if granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

export function fireNotification(title: string, body: string): void {
  if (notificationsSupported() && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
