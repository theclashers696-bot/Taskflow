"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

async function fetchNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const clearRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  const typeIcon: Record<string, string> = {
    info: "🔔",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-80 p-0 max-h-[480px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          <div className="flex gap-1">
            {unread > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                title="Mark all read"
                onClick={() => markAllRead.mutate()}
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              title="Clear read notifications"
              onClick={() => clearRead.mutate()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id}>
                <div
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer",
                    !n.read && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (!n.read) markRead.mutate(n.id);
                  }}
                >
                  <span className="text-base mt-0.5 shrink-0">
                    {typeIcon[n.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium leading-snug", !n.read && "text-foreground")}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="text-xs text-primary hover:underline mt-1 block"
                        onClick={() => setOpen(false)}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
                <Separator />
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
