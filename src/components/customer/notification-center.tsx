"use client";

import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/provider/auth-provider";
import { Badge } from "@/components/ui/badge";

export function NotificationCenter() {
  const {
    user,
    notifications,
    fetchNotifications,
    markAllNotificationsAsRead,
  } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.user_id]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute flex flex-col justify-center items-center -top-1 -right-1 h-5 w-5 p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <Button
          variant="default"
          size="sm"
          className="w-full mb-2"
          onClick={markAllNotificationsAsRead}
        >
          Mark All as Read
        </Button>
        <ScrollArea className="h-80 p-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`p-4 ${notification.is_read ? "" : "bg-accent"}`}
              >
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <p className="text-sm">{notification.message}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center">No notifications</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
