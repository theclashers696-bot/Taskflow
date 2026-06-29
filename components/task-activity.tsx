"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import type { ActivityLog } from "@/types";

async function fetchActivity(taskId: number): Promise<ActivityLog[]> {
  const res = await fetch(`/api/tasks/${taskId}/activity`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const ACTION_ICONS: Record<string, string> = {
  created: "✨",
  updated: "✏️",
  commented: "💬",
  archived: "📦",
  restored: "♻️",
  "deleted a comment": "🗑️",
};

export function TaskActivity({ taskId }: { taskId: number }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity", taskId],
    queryFn: () => fetchActivity(taskId),
  });

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Activity</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start">
              <div className="relative shrink-0">
                <Avatar className="w-7 h-7">
                  {log.user?.image && <AvatarImage src={log.user.image} />}
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {log.user?.name ? initials(log.user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">
                  {ACTION_ICONS[log.action] ?? "📋"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug">
                  <span className="font-medium">{log.user?.name}</span>{" "}
                  <span className="text-muted-foreground">{log.action}</span>
                  {log.detail && (
                    <span className="text-muted-foreground"> — {log.detail}</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
