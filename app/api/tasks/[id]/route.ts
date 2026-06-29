import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional().nullable(),
  teamId: z.number().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  archived: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        assignee: { select: { id: true, name: true, image: true } },
        team: { select: { id: true, name: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (err) {
    console.error("GET /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const existing = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: parsed.data,
      include: {
        creator: { select: { id: true, name: true, image: true } },
        assignee: { select: { id: true, name: true, image: true } },
        team: { select: { id: true, name: true } },
        labels: { include: { label: true } },
        _count: { select: { comments: true } },
      },
    });

    const data = parsed.data;
    const changes: string[] = [];
    if (data.status && data.status !== existing.status) {
      const labels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", done: "Done" };
      changes.push(`status to ${labels[data.status] ?? data.status}`);
    }
    if (data.priority && data.priority !== existing.priority) changes.push(`priority to ${data.priority}`);
    if (data.title && data.title !== existing.title) changes.push("title");
    if (data.dueDate !== undefined && data.dueDate !== existing.dueDate) changes.push("due date");

    if (changes.length > 0) {
      await prisma.activityLog.create({
        data: {
          taskId: Number(id),
          userId: session.user.id,
          action: "updated",
          detail: `Changed ${changes.join(", ")}`,
        },
      });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error("PATCH /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (task.creatorId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.task.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
