"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, CheckSquare, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamDialog } from "@/components/team-dialog";
import { formatDate } from "@/lib/utils";
import type { Team } from "@/types";

async function fetchTeams() {
  const res = await fetch("/api/teams");
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<Team[]>;
}

export default function TeamsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: teams = [], isLoading } = useQuery({ queryKey: ["teams"], queryFn: fetchTeams });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teams"] }); toast.success("Team deleted"); },
    onError: () => toast.error("Failed to delete team"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">Collaborate with your team members</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> New Team</Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No teams yet. Create one to start collaborating.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Team</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="border-border/50 hover:border-primary/30 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(team.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/teams/${team.id}`} className="block">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{team.name}</h3>
                  {team.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{team.description}</p>}

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {team._count?.members ?? 0} members</span>
                    <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> {team._count?.tasks ?? 0} tasks</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Created {formatDate(team.createdAt)}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeamDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={() => qc.invalidateQueries({ queryKey: ["teams"] })} />
    </div>
  );
}
