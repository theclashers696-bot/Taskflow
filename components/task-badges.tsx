import { cn, STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS, PRIORITY_LABELS, type TaskStatus, type TaskPriority } from "@/lib/utils";

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[status as TaskStatus] ?? "bg-muted text-muted-foreground")}>
      {STATUS_LABELS[status as TaskStatus] ?? status}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", PRIORITY_COLORS[priority as TaskPriority] ?? "bg-muted text-muted-foreground")}>
      {PRIORITY_LABELS[priority as TaskPriority] ?? priority}
    </span>
  );
}
