"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Trash2, Calendar, Users, User, Archive, RotateCcw, MessageSquare, Activity,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/task-badges";
import { TaskDialog } from "@/components/task-dialog";
import { TaskComments } from "@/components/task-comments";
import { TaskActivity } from "@/components/task-activity";
import { formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types";

type Tab = "details" | "comments" | "activity";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("details");

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { toast.success("Task deleted"); router.push("/tasks"); },
    onError: () => toast.error("Failed to delete task"),
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${id}/archive`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(task?.archived ? "Task restored" : "Task archived");
    },
    onError: () => toast.error("Operation failed"),
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "details", label: "Details", icon: User },
    { id: "comments", label: `Comments${task?._count?.comments ? ` (${task._count.comments})` : ""}`, icon: MessageSquare },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground mb-4">Task not found</p>
        <Link href="/tasks"><Button variant="outline">Back to Tasks</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="mt-0.5"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold leading-snug">{task.title}</h1>
          {task.archived && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mt-1">
              <Archive className="w-3 h-3" /> Archived
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!task.archived && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => archiveMutation.mutate()}
            disabled={archiveMutation.isPending}
            className="gap-1.5"
          >
            {task.archived
              ? <><RotateCcw className="w-3.5 h-3.5" /> Restore</>
              : <><Archive className="w-3.5 h-3.5" /> Archive</>
            }
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tabId
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "details" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Task Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-3 flex-wrap">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>

            {task.description && (
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Description</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {task.dueDate && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due Date
                  </p>
                  <p className={`text-sm font-medium ${isOverdue(task.dueDate) && task.status !== "done" ? "text-red-500" : ""}`}>
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              )}
              {task.team && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Team
                  </p>
                  <Link href={`/teams/${task.team.id}`} className="text-sm font-medium text-primary hover:underline">
                    {task.team.name}
                  </Link>
                </div>
              )}
              {task.assignee && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Assignee
                  </p>
                  <p className="text-sm font-medium">{task.assignee.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Created by</p>
                <p className="text-sm font-medium">{task.creator?.name}</p>
              </div>
            </div>

            <Separator />
            <p className="text-xs text-muted-foreground">
              Created {formatDate(task.createdAt)} · Last updated {formatDate(task.updatedAt)}
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "comments" && (
        <Card>
          <CardContent className="pt-5">
            <TaskComments taskId={Number(id)} />
          </CardContent>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card>
          <CardContent className="pt-5">
            <TaskActivity taskId={Number(id)} />
          </CardContent>
        </Card>
      )}

      <TaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["task", id] });
          qc.invalidateQueries({ queryKey: ["tasks"] });
          qc.invalidateQueries({ queryKey: ["activity", Number(id)] });
        }}
      />
    </div>
  );
}
