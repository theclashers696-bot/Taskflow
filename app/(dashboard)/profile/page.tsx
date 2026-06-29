"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession, updateUser, changePassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Camera, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(200).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, refetch } = useSession();
  const user = session?.user;
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", bio: (user as { bio?: string })?.bio ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSave(data: ProfileForm) {
    setSavingProfile(true);
    try {
      await updateUser({ name: data.name, image: user?.image });
      // Also save bio via API
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: data.bio }),
      });
      await refetch();
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onPasswordSave(data: PasswordForm) {
    setSavingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (result.error) throw new Error(result.error.message);
      toast.success("Password changed!");
      passwordForm.reset();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      await updateUser({ image: url });
      await refetch();
      toast.success("Avatar updated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Avatar</CardTitle>
          <CardDescription>Upload a profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {user?.image && <AvatarImage src={user.image} />}
              <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              {uploading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />
              }
            </button>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Uploading…</> : "Change photo"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or WebP — max 5 MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-red-500 text-xs">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea
                {...profileForm.register("bio")}
                placeholder="Tell your team a bit about yourself…"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {(profileForm.watch("bio") ?? "").length}/200 characters
              </p>
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input {...passwordForm.register("currentPassword")} type="password" />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-500 text-xs">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input {...passwordForm.register("newPassword")} type="password" placeholder="Min. 8 characters" />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-xs">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input {...passwordForm.register("confirmPassword")} type="password" />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your tasks, teams, and data will be
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeleteConfirm(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
