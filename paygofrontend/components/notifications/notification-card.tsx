"use client"

import { Notification } from '@/lib/types/notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Check } from 'lucide-react'

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const handleMarkAsRead = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card className={`transition-all ${!notification.isRead ? 'bg-white/5 border-white/20' : 'bg-white/5 border-white/10'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
            <Bell className={`h-4 w-4 ${!notification.isRead ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white mb-1">{notification.title}</h4>
            <p className="text-sm text-gray-300 mb-2">{notification.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {notification.category}
              </Badge>
              <span className="text-xs text-gray-400">
                {new Date(notification.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              className="text-gray-400 hover:text-white"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
