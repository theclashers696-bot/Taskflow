"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  changePassword,
  resetPassword,
} = authClient;

export async function forgetPassword({ email, redirectTo }: { email: string; redirectTo: string }) {
  const res = await fetch("/api/auth/forget-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Failed to send reset email");
  }
  return res.json();
}
