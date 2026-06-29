"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import {
  LayoutDashboard, CheckSquare, Users, User, Settings, LogOut, Menu, X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/teams", icon: Users, label: "Teams" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  user: { name: string; email: string; image?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const NavContent = () => (
    <>
      {/* Logo + notification bell */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0">T</div>
        <span className="text-sidebar-foreground font-semibold text-lg flex-1">TaskFlow</span>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="w-8 h-8 shrink-0">
            {user.image && <AvatarImage src={user.image} />}
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent w-7 h-7" onClick={handleSignOut} title="Sign out">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={() => setOpen(!open)}>
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200 md:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-sidebar flex-col shrink-0">
        <NavContent />
      </div>
    </>
  );
}
