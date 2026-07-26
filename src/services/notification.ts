export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export function sendNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: icon || "/favicon.svg",
    badge: "/favicon.svg",
  });
}

export function isSupported(): boolean {
  return "Notification" in window;
}
