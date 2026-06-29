"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/task-badges";
import { TaskDialog } from "@/components/task-dialog";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import type { Task } from "@/types";

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "done", label: "Done", color: "bg-green-500" },
];

function DraggableTaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border/60 rounded-lg p-3 shadow-sm transition-shadow group",
        isDragging ? "opacity-50" : "hover:shadow-md hover:border-primary/30"
      )}
    >
      {/* Drag handle + title */}
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0 hover:text-primary">
          <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>
        </Link>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1.5 ml-5.5 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-2 flex-wrap ml-5.5">
        <TaskPriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span
            className={cn(
              "text-xs",
              isOverdue(task.dueDate) && task.status !== "done"
                ? "text-red-500 font-medium"
                : "text-muted-foreground"
            )}
          >
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.team && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {task.team.name}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  color,
  tasks,
  onAddTask,
}: {
  status: string;
  label: string;
  color: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[280px] md:min-w-0 md:flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 ml-auto">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 min-h-[200px] transition-colors",
          isOver ? "border-primary/50 bg-primary/5" : "border-border/40 bg-muted/20"
        )}
      >
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground justify-start gap-2 text-xs h-8"
          onClick={() => onAddTask(status)}
        >
          <Plus className="w-3.5 h-3.5" /> Add task
        </Button>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const qc = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: () => toast.error("Failed to move task"),
  });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;
      const newStatus = over.id as string;
      const task = tasks.find((t) => t.id === active.id);
      if (!task || task.status === newStatus) return;
      updateStatus.mutate({ id: task.id, status: newStatus });
    },
    [tasks, updateStatus]
  );

  const handleAddTask = (status: string) => {
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const tasksByStatus = COLUMNS.reduce<Record<string, Task[]>>((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              label={col.label}
              color={col.color}
              tasks={tasksByStatus[col.id] ?? []}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <DraggableTaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={null}
        defaultStatus={defaultStatus}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["tasks"] })}
      />
    </>
  );
}
