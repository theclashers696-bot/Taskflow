"use client";

import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user as { notificationsEmail?: boolean; notificationsPush?: boolean; notificationsDeadline?: boolean } | undefined;

  const [notif, setNotif] = useState({
    email: user?.notificationsEmail ?? true,
    push: user?.notificationsPush ?? true,
    deadline: user?.notificationsDeadline ?? true,
  });

  useEffect(() => {
    if (user) {
      setNotif({
        email: user.notificationsEmail ?? true,
        push: user.notificationsPush ?? true,
        deadline: user.notificationsDeadline ?? true,
      });
    }
  }, [user]);

  async function saveNotifications() {
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationsEmail: notif.email,
          notificationsPush: notif.push,
          notificationsDeadline: notif.deadline,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your TaskFlow experience</p>
      </div>

      {/* Appearance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  theme === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-accent"
                )}
              >
                <Icon className={cn("w-5 h-5", theme === value ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", theme === value ? "text-primary" : "text-foreground")}>{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Control how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { key: "email" as const, label: "Email notifications", desc: "Receive task updates and team changes via email" },
            { key: "push" as const, label: "Push notifications", desc: "Browser notifications for real-time updates" },
            { key: "deadline" as const, label: "Deadline reminders", desc: "Get reminded when tasks are approaching their due date" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Switch
                checked={notif[key]}
                onCheckedChange={(checked) => setNotif((prev) => ({ ...prev, [key]: checked }))}
              />
            </div>
          ))}

          <Button onClick={saveNotifications} className="mt-2">Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session?.user?.email}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            To update your password or profile information, visit the{" "}
            <a href="/profile" className="text-primary hover:underline">Profile page</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
