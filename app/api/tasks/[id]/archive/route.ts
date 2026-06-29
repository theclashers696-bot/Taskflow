import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id: Number(id) } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.creatorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const newArchived = !task.archived;

  const [updated] = await prisma.$transaction([
    prisma.task.update({
      where: { id: Number(id) },
      data: { archived: newArchived },
    }),
    prisma.activityLog.create({
      data: {
        taskId: Number(id),
        userId: session.user.id,
        action: newArchived ? "archived" : "restored",
      },
    }),
  ]);

  return NextResponse.json(updated);
}
