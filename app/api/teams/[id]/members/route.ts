import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const InviteSchema = z.object({ email: z.string().email() });

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

  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const team = await prisma.team.findUnique({ where: { id: Number(id) } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (team.ownerId !== session.user.id)
      return NextResponse.json({ error: "Forbidden — only the owner can invite members" }, { status: 403 });

    const userToAdd = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!userToAdd) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.teamMember.findFirst({
      where: { teamId: Number(id), userId: userToAdd.id },
    });
    if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

    const member = await prisma.teamMember.create({
      data: { teamId: Number(id), userId: userToAdd.id, role: "member" },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("POST /api/teams/[id]/members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const team = await prisma.team.findUnique({ where: { id: Number(id) } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (team.ownerId !== session.user.id && userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.teamMember.deleteMany({ where: { teamId: Number(id), userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/teams/[id]/members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
