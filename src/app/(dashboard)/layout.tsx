"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Heart,
  Trophy,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/scores", icon: Target, label: "My Scores" },
  { href: "/dashboard/charity", icon: Heart, label: "My Charity" },
  { href: "/dashboard/draws", icon: Trophy, label: "Draws" },
  { href: "/dashboard/subscribe", icon: CreditCard, label: "Subscription" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => setUser(profile));
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full p-4 gap-2">
      <div className="px-3 py-4 mb-2">
        <Link href="/" className="text-xl font-bold gradient-text">
          GolfGives
        </Link>
        {user && (
          <div className="mt-3">
            <p className="text-sm font-medium text-white truncate">
              {user.full_name || "Golfer"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
              pathname === href
                ? "bg-green-500/15 text-green-400 font-medium"
                : "text-gray-400 hover:text-white hover:bg-white/5",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/5 fixed h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-[#111] border-r border-white/5 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-lg font-bold gradient-text">GolfGives</span>
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
