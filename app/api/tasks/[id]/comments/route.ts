import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const comments = await prisma.taskComment.findMany({
      where: { taskId: Number(id) },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (err) {
    console.error("GET /api/tasks/[id]/comments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: Number(id) } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const [comment] = await prisma.$transaction([
      prisma.taskComment.create({
        data: { taskId: Number(id), userId: session.user.id, content: parsed.data.content },
        include: { user: { select: { id: true, name: true, image: true } } },
      }),
      prisma.activityLog.create({
        data: {
          taskId: Number(id),
          userId: session.user.id,
          action: "commented",
          detail: parsed.data.content.length > 80 ? parsed.data.content.slice(0, 80) + "…" : parsed.data.content,
        },
      }),
    ]);

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks/[id]/comments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const commentId = searchParams.get("commentId");

  if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

  try {
    const comment = await prisma.taskComment.findUnique({ where: { id: Number(commentId) } });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (comment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.taskComment.delete({ where: { id: Number(commentId) } });

    await prisma.activityLog.create({
      data: {
        taskId: Number(id),
        userId: session.user.id,
        action: "deleted a comment",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tasks/[id]/comments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
