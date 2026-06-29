import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  try {
    const teams = await prisma.team.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(teams);
  } catch (err) {
    console.error("GET /api/teams error:", err);
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

  const parsed = TeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const team = await prisma.team.create({
      data: {
        ...parsed.data,
        ownerId: session.user.id,
        members: { create: { userId: session.user.id, role: "owner" } },
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (err) {
    console.error("POST /api/teams error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
