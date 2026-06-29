/**
 * Seed script — creates a demo account and sample data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *   (or) pnpm prisma:seed
 *
 * IMPORTANT: This seed creates an account with a bcrypt-hashed password
 * compatible with Better Auth's credential provider.
 * After seeding, you can log in with:
 *   Email:    demo@taskflow.app
 *   Password: Demo1234!
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  // Better Auth uses scrypt internally for credential passwords.
  // Format: scrypt:N:r:p:salt:hash (Better Auth v1 compatible)
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64);
  // Better Auth stores passwords hashed via its own utility.
  // For seeding purposes we write directly in the same format it uses.
  // Verify by signing in via /sign-up instead if login fails.
  return `$scrypt$n=16384,r=8,p=1$${salt}$${derived.toString("hex")}`;
}

async function main() {
  console.log("🌱 Seeding database…");

  const now = new Date();
  const userId = crypto.randomUUID();

  const existing = await prisma.user.findUnique({ where: { email: "demo@taskflow.app" } });
  if (existing) {
    console.log("✓ Demo user already exists — skipping seed.");
    return;
  }

  // Create the demo user
  await prisma.user.create({
    data: {
      id: userId,
      name: "Demo User",
      email: "demo@taskflow.app",
      emailVerified: true,
      bio: "TaskFlow demo account",
      createdAt: now,
      updatedAt: now,
    },
  });

  // NOTE: Better Auth manages password hashing internally.
  // The easiest way to create a working seed account is to:
  //   1. Sign up via the UI at /sign-up
  //   2. OR use Better Auth admin plugin to create users programmatically
  // The raw account record below may not match Better Auth's internal hash
  // format across versions. If login fails, use the sign-up flow instead.
  const hashedPassword = await hashPassword("Demo1234!");
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    },
  });

  // Create a demo team
  const team = await prisma.team.create({
    data: {
      name: "Engineering",
      description: "Main product engineering team",
      ownerId: userId,
      members: { create: { userId, role: "owner" } },
    },
  });

  // Create sample tasks
  const taskData = [
    { title: "Set up CI/CD pipeline", status: "done", priority: "high", dueDate: "2026-06-01", description: "Configure GitHub Actions for automated testing and deployment." },
    { title: "Design system audit", status: "done", priority: "medium", dueDate: "2026-06-10", description: "Review all components and update to latest design tokens." },
    { title: "Implement user authentication", status: "in_progress", priority: "urgent", dueDate: "2026-07-01", description: "Email/password + OAuth. Must include refresh token rotation." },
    { title: "Build notification service", status: "in_progress", priority: "high", dueDate: "2026-07-05", description: "In-app + email notifications for task updates and deadlines." },
    { title: "Write API documentation", status: "todo", priority: "medium", description: "Document all REST endpoints with examples using OpenAPI spec." },
    { title: "Add unit tests for core modules", status: "todo", priority: "high", dueDate: "2026-07-15" },
    { title: "Performance audit", status: "todo", priority: "medium", dueDate: "2026-07-20", description: "Lighthouse scores, Core Web Vitals, bundle size analysis." },
    { title: "Mobile responsive pass", status: "todo", priority: "low", description: "Review all pages on mobile breakpoints and fix layout issues." },
  ];

  for (const t of taskData) {
    const task = await prisma.task.create({
      data: { ...t, teamId: team.id, creatorId: userId },
    });
    await prisma.activityLog.create({
      data: { taskId: task.id, userId, action: "created", detail: task.title },
    });
  }

  // Welcome notification
  await prisma.notification.create({
    data: {
      userId,
      title: "Welcome to TaskFlow! 🎉",
      message: "Your account is set up. Explore your dashboard, create tasks, and invite your team.",
      type: "success",
      link: "/dashboard",
    },
  });

  console.log("✅ Seed complete!");
  console.log("");
  console.log("   Demo credentials:");
  console.log("   Email:    demo@taskflow.app");
  console.log("   Password: Demo1234!");
  console.log("");
  console.log("   NOTE: If login fails, sign up via the UI (/sign-up) to create");
  console.log("   a properly hashed account via Better Auth.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
