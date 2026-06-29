"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, Trash2, Crown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/task-badges";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import type { Task, TeamMember } from "@/types";

const inviteSchema = z.object({ email: z.string().email() });

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const { data: session } = useSession();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(inviteSchema),
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await fetch(`/api/teams/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to invite");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["team", id] }); toast.success("Member invited!"); reset(); setInviteOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/teams/${id}/members?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["team", id] }); toast.success("Member removed"); },
    onError: () => toast.error("Failed to remove member"),
  });

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!team) return <div className="text-center py-16 text-muted-foreground">Team not found</div>;

  const isOwner = session?.user?.id === team.ownerId;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/teams"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.description && <p className="text-muted-foreground text-sm mt-0.5">{team.description}</p>}
        </div>
        {isOwner && <Button onClick={() => setInviteOpen(true)} className="gap-2"><UserPlus className="w-4 h-4" /> Invite Member</Button>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Members */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Members ({team.members?.length ?? 0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {team.members?.map((m: TeamMember) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  {m.user?.image && <AvatarImage src={m.user.image} />}
                  <AvatarFallback className="text-xs">{m.user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{m.user?.name}</p>
                    {m.role === "owner" && <Crown className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                </div>
                {isOwner && m.userId !== session?.user?.id && (
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => removeMutation.mutate(m.userId)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Tasks ({team.tasks?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {team.tasks?.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No tasks assigned to this team yet.</p>
            ) : (
              <div className="space-y-2.5">
                {team.tasks?.slice(0, 10).map((task: Task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary">{task.title}</p>
                      {task.dueDate && <p className="text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <TaskPriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => inviteMutation.mutate(d))}>
            <div className="space-y-3 py-2">
              <Label>Email address</Label>
              <Input {...register("email")} type="email" placeholder="colleague@company.com" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Inviting…" : "Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
