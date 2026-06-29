"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/task-badges";
import { formatDate, isOverdue } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

async function fetchDashboard() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

const STATUS_CHART_COLORS: Record<string, string> = {
  todo: "#94a3b8",
  in_progress: "#3b82f6",
  done: "#22c55e",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Total Tasks", value: data?.summary?.totalTasks ?? 0, icon: CheckSquare, color: "text-blue-500" },
    { label: "Completed", value: data?.summary?.completedTasks ?? 0, icon: TrendingUp, color: "text-green-500" },
    { label: "In Progress", value: data?.summary?.inProgressTasks ?? 0, icon: Clock, color: "text-yellow-500" },
    { label: "Overdue", value: data?.summary?.overdueTasks ?? 0, icon: AlertTriangle, color: "text-red-500" },
    { label: "Teams", value: data?.summary?.totalTeams ?? 0, icon: Users, color: "text-purple-500" },
    {
      label: "Completion Rate",
      value: `${data?.summary?.completionRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
  ];

  const chartData = (data?.tasksByStatus ?? []).map((g: { status: string; count: number }) => ({
    name: g.status === "in_progress" ? "In Progress" : g.status === "todo" ? "To Do" : "Done",
    count: g.count,
    status: g.status,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good day, {firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your tasks today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : stats.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-border/50">
                <CardContent className="p-4 flex flex-col gap-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48" />
            ) : chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry: { status: string }) => (
                      <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
            <Link href="/tasks"><Button variant="ghost" size="sm" className="text-xs gap-1">View all <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : data?.upcomingTasks?.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">No upcoming deadlines 🎉</div>
            ) : (
              <div className="space-y-2.5">
                {data?.upcomingTasks?.map((task: { id: number; title: string; dueDate: string; priority: string; status: string }) => (
                  <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary">{task.title}</p>
                      <p className={`text-xs mt-0.5 ${isOverdue(task.dueDate) ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                        Due {formatDate(task.dueDate)} {isOverdue(task.dueDate) && "• Overdue"}
                      </p>
                    </div>
                    <TaskPriorityBadge priority={task.priority} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <Link href="/tasks"><Button variant="ghost" size="sm" className="text-xs gap-1">All tasks <ArrowRight className="w-3 h-3" /></Button></Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : data?.recentTasks?.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No tasks yet.{" "}
              <Link href="/tasks" className="text-primary hover:underline">Create your first task →</Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data?.recentTasks?.map((task: { id: number; title: string; status: string; priority: string; dueDate: string | null; team: { name: string } | null }) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-4 py-3 hover:bg-accent/50 px-2 -mx-2 rounded-lg transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.team && <span className="text-xs text-muted-foreground">{task.team.name}</span>}
                      {task.dueDate && <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== "done" ? "text-red-500" : "text-muted-foreground"}`}>Due {formatDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
  );
}
