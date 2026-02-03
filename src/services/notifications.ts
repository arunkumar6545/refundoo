import type { Refund } from '../types';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

class NotificationService {
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, type: NotificationType = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  getToasts() {
    return [...this.toasts];
  }
}

export const notificationService = new NotificationService();

// Browser notifications
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

// SMS/Email helpers
export function generateSMSText(refund: Refund): string {
  const statusMessages: Record<string, string> = {
    PENDING: 'Your refund request is being reviewed.',
    APPROVED: 'Your refund has been approved and will be processed shortly.',
    REJECTED: 'Unfortunately, your refund request has been rejected.',
    PAID: 'Your refund has been processed and paid.',
  };

  return `Hi ${refund.customerName}, ${statusMessages[refund.status] || 'Update on your refund request.'} Refund ID: ${refund.id}. Amount: ${refund.currency} ${refund.amount}.`;
}

export function generateEmailDraft(refund: Refund): { subject: string; body: string } {
  const statusMessages: Record<string, string> = {
    PENDING: 'Refund Request Under Review',
    APPROVED: 'Refund Approved',
    REJECTED: 'Refund Request Update',
    PAID: 'Refund Processed',
  };

  const subject = `${statusMessages[refund.status] || 'Refund Update'} - Order ${refund.orderId}`;
  const body = `Dear ${refund.customerName},\n\n` +
    `We wanted to update you on your refund request.\n\n` +
    `Refund ID: ${refund.id}\n` +
    `Order ID: ${refund.orderId}\n` +
    `Amount: ${refund.currency} ${refund.amount}\n` +
    `Status: ${refund.status}\n` +
    `Reason: ${refund.reason}\n\n` +
    (refund.notes ? `Notes: ${refund.notes}\n\n` : '') +
    `If you have any questions, please don't hesitate to contact us.\n\n` +
    `Best regards,\nRefunds Team`;

  return { subject, body };
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function openEmailDraft(subject: string, body: string): void {
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
}
