import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/utils";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const allTasks = await prisma.task.findMany({
    where: { OR: [{ creatorId: userId }, { assigneeId: userId }] },
    select: { status: true, dueDate: true },
  });

  const [teams, recentTasks, tasksByStatus] = await Promise.all([
    prisma.team.count({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    }),
    prisma.task.findMany({
      where: { OR: [{ creatorId: userId }, { assigneeId: userId }] },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        creator: { select: { id: true, name: true, image: true } },
        assignee: { select: { id: true, name: true, image: true } },
        team: { select: { id: true, name: true } },
      },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { OR: [{ creatorId: userId }, { assigneeId: userId }] },
      _count: { status: true },
    }),
  ]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "in_progress").length;
  const overdueTasks = allTasks.filter((t) => t.status !== "done" && isOverdue(t.dueDate)).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const upcomingTasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }, { assigneeId: userId }],
      status: { not: "done" },
      dueDate: { not: null },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
    include: {
      team: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    summary: { totalTasks, completedTasks, inProgressTasks, overdueTasks, completionRate, totalTeams: teams },
    recentTasks,
    upcomingTasks,
    tasksByStatus: tasksByStatus.map((g) => ({ status: g.status, count: g._count.status })),
  });
}
