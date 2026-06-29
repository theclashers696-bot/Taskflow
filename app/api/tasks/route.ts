import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional().nullable(),
  teamId: z.number().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const teamId = searchParams.get("teamId");

  const userId = session.user.id;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(teamId ? { teamId: Number(teamId) } : {}),
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        assignee: { select: { id: true, name: true, image: true } },
        team: { select: { id: true, name: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = TaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const task = await prisma.task.create({
      data: { ...parsed.data, creatorId: session.user.id },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        assignee: { select: { id: true, name: true, image: true } },
        team: { select: { id: true, name: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        userId: session.user.id,
        action: "created",
        detail: task.title,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
