import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3000}`,
  secret: process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET || "changeme-secret-32chars-minimum!!",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      bio: { type: "string", required: false },
      notificationsEmail: { type: "boolean", required: false, defaultValue: true },
      notificationsPush: { type: "boolean", required: false, defaultValue: true },
      notificationsDeadline: { type: "boolean", required: false, defaultValue: true },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    ...(googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : {}),
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
