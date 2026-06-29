import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  notificationsEmail: z.boolean().optional(),
  notificationsPush: z.boolean().optional(),
  notificationsDeadline: z.boolean().optional(),
  bio: z.string().max(200).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    return NextResponse.json(user);
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error("PATCH /api/users/me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/users/me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
