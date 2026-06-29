"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface TeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TeamDialog({ open, onOpenChange, onSuccess }: TeamDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create team");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Team created!");
      onSuccess();
      onOpenChange(false);
      reset();
    },
    onError: () => toast.error("Failed to create team"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Team Name *</Label>
            <Input {...register("name")} placeholder="e.g. Engineering, Design…" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...register("description")} placeholder="What does this team work on?" rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
