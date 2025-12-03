export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  category: 'all' | 'transactions' | 'services' | 'system';
  icon?: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export type NotificationCategory = 'all' | 'transactions' | 'services' | 'system';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  balanceAlerts: boolean;
  usageAlerts: boolean;
  sessionReminders: boolean;
}