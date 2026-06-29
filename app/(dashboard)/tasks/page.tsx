"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Filter, MoreVertical, Pencil, Trash2, Eye,
  LayoutGrid, List, Archive, RotateCcw, CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/task-badges";
import { TaskDialog } from "@/components/task-dialog";
import { KanbanBoard } from "@/components/kanban-board";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import type { Task } from "@/types";

type View = "list" | "kanban";

async function fetchTasks(params: Record<string, string>) {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "all"))
  );
  const res = await fetch(`/api/tasks?${q}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json() as Promise<Task[]>;
}

export default function TasksPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<View>("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ["tasks", search, status, priority],
    queryFn: () => fetchTasks({ search, status, priority }),
  });

  const tasks = allTasks.filter((t) => t.archived === showArchived);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/tasks/${id}/archive`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(showArchived ? "Task restored" : "Task archived");
    },
    onError: () => toast.error("Operation failed"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, { method: "DELETE" })));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSelected(new Set());
      toast.success("Tasks deleted");
    },
    onError: () => toast.error("Bulk delete failed"),
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}/archive`, { method: "POST" })));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSelected(new Set());
      toast.success("Tasks updated");
    },
    onError: () => toast.error("Bulk operation failed"),
  });

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === tasks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tasks.map((t) => t.id)));
    }
  }

  const allSelected = tasks.length > 0 && selected.size === tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {showArchived ? "Archived tasks" : "Manage and track all your tasks"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 gap-0.5">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setView("list")}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setView("kanban")}
              title="Kanban view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Archive toggle */}
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => { setShowArchived(!showArchived); setSelected(new Set()); }}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? "Active" : "Archived"}
          </Button>

          {!showArchived && (
            <Button onClick={() => { setEditTask(null); setDialogOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => bulkArchiveMutation.mutate([...selected])}
              disabled={bulkArchiveMutation.isPending}
            >
              {showArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              {showArchived ? "Restore" : "Archive"} selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => bulkDeleteMutation.mutate([...selected])}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete selected
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            {showArchived ? (
              <>
                <Archive className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm mb-2">No archived tasks</p>
                <Button variant="outline" size="sm" onClick={() => setShowArchived(false)}>
                  View active tasks
                </Button>
              </>
            ) : (
              <>
                <CheckSquare className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm mb-4">
                  {search || status !== "all" || priority !== "all"
                    ? "No tasks match your filters."
                    : "No tasks yet. Create your first task to get started."}
                </p>
                {!search && status === "all" && priority === "all" && (
                  <Button onClick={() => setDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Create Task
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : view === "kanban" ? (
        <KanbanBoard tasks={tasks} />
      ) : (
        <div className="space-y-2">
          {/* Select all */}
          <div className="flex items-center gap-2 px-1 py-1">
            <button
              onClick={toggleSelectAll}
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                allSelected
                  ? "bg-primary border-primary text-white"
                  : "border-border hover:border-primary/50"
              )}
            >
              {allSelected && <CheckSquare className="w-3 h-3" />}
            </button>
            <span className="text-xs text-muted-foreground">
              {allSelected ? "Deselect all" : `Select all (${tasks.length})`}
            </span>
          </div>

          {tasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "border-border/50 hover:border-primary/30 transition-colors",
                selected.has(task.id) && "border-primary/50 bg-primary/5"
              )}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(task.id)}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                    selected.has(task.id)
                      ? "bg-primary border-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {selected.has(task.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.team && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {task.team.name}
                      </span>
                    )}
                    {task.archived && (
                      <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Archive className="w-3 h-3" /> Archived
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {task.dueDate && (
                      <span
                        className={cn(
                          "text-xs",
                          isOverdue(task.dueDate) && task.status !== "done"
                            ? "text-red-500 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="text-xs text-muted-foreground">→ {task.assignee.name}</span>
                    )}
                    {(task._count?.comments ?? 0) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        💬 {task._count?.comments}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <TaskPriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${task.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Link>
                      </DropdownMenuItem>
                      {!task.archived && (
                        <DropdownMenuItem
                          onClick={() => { setEditTask(task); setDialogOpen(true); }}
                        >
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => archiveMutation.mutate(task.id)}>
                        {task.archived
                          ? <><RotateCcw className="w-4 h-4 mr-2" /> Restore</>
                          : <><Archive className="w-4 h-4 mr-2" /> Archive</>
                        }
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(task.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editTask}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["tasks"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />
    </div>
  );
}
