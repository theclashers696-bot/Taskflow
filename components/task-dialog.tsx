"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Task, Team } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  dueDate: z.string().optional(),
  teamId: z.string().optional(),
  assigneeId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: string;
  onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, task, defaultStatus = "todo", onSuccess }: TaskDialogProps) {
  const isEdit = !!task;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", description: "", status: defaultStatus, priority: "medium",
      dueDate: "", teamId: "", assigneeId: "",
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? "",
        teamId: task.teamId ? String(task.teamId) : "",
        assigneeId: task.assigneeId ?? "",
      });
    } else {
      reset({ title: "", description: "", status: defaultStatus, priority: "medium", dueDate: "", teamId: "", assigneeId: "" });
    }
  }, [task, reset, open, defaultStatus]);

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: async () => { const r = await fetch("/api/teams"); return r.json(); },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEdit ? `/api/tasks/${task!.id}` : "/api/tasks";
      const method = isEdit ? "PATCH" : "POST";
      const body = {
        ...data,
        teamId: data.teamId ? Number(data.teamId) : null,
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate || null,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to save task");
      return res.json();
    },
    onSuccess: () => {
      toast.success(isEdit ? "Task updated" : "Task created");
      onSuccess();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to save task"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input {...register("title")} placeholder="Task title" autoFocus />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...register("description")} placeholder="Optional details…" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input {...register("dueDate")} type="date" />
          </div>

          {teams.length > 0 && (
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select value={watch("teamId")} onValueChange={(v) => setValue("teamId", v)}>
                <SelectTrigger><SelectValue placeholder="No team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No team</SelectItem>
                  {teams.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
