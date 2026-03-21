"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Heart,
  CheckSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/draws", icon: Trophy, label: "Draws" },
  { href: "/admin/charities", icon: Heart, label: "Charities" },
  { href: "/admin/winners", icon: CheckSquare, label: "Winners" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("users")
        .select("full_name, role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.role !== "admin") router.push("/dashboard");
          setAdminName(profile?.full_name || "Admin");
        });
    });
  }, [router]);

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
        <div className="mt-1">
          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-full px-2 py-0.5">
            Admin Panel
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{adminName}</p>
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
                ? "bg-purple-500/15 text-purple-400 font-medium"
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
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <div className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/5 fixed h-full">
        <Sidebar />
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-[#111] border-r border-white/5 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-lg font-bold gradient-text">
            GolfGives Admin
          </span>
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
