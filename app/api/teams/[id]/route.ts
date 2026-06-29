import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        tasks: {
          include: {
            creator: { select: { id: true, name: true, image: true } },
            assignee: { select: { id: true, name: true, image: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 20,
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(team);
  } catch (err) {
    console.error("GET /api/teams/[id] error:", err);
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
    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: parsed.data,
      include: { owner: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(team);
  } catch (err) {
    console.error("PATCH /api/teams/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const team = await prisma.team.findUnique({ where: { id: Number(id) } });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (team.ownerId !== session.user.id)
      return NextResponse.json({ error: "Forbidden — only the owner can delete this team" }, { status: 403 });

    await prisma.team.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/teams/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
