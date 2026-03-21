import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Trophy,
  Heart,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { count: totalDraws },
    { count: pendingWinners },
    { count: totalCharities },
    { data: winners },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("draws").select("*", { count: "exact", head: true }),
    supabase
      .from("winners")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("charities")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("winners").select("prize_amount").eq("status", "paid"),
  ]);

  const totalPaidOut =
    winners?.reduce((sum, w) => sum + Number(w.prize_amount), 0) ?? 0;
  const monthlyRevenue = (activeSubscribers ?? 0) * 999;

  const cards = [
    {
      icon: Users,
      label: "Total users",
      value: String(totalUsers ?? 0),
      sub: `${activeSubscribers ?? 0} active subscribers`,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: CreditCard,
      label: "Monthly revenue",
      value: formatCurrency(monthlyRevenue),
      sub: "Based on active subs",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: Trophy,
      label: "Total draws",
      value: String(totalDraws ?? 0),
      sub: "All time",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: TrendingUp,
      label: "Total paid out",
      value: formatCurrency(totalPaidOut),
      sub: "Prize payments",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      icon: Heart,
      label: "Active charities",
      value: String(totalCharities ?? 0),
      sub: "Listed on platform",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
    {
      icon: AlertCircle,
      label: "Pending winners",
      value: String(pendingWinners ?? 0),
      sub: "Need verification",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Platform health at a glance
        </p>
      </div>

      {pendingWinners !== null && pendingWinners > 0 && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-300 font-medium">
              {pendingWinners} winner{pendingWinners > 1 ? "s" : ""} awaiting
              verification
            </p>
            <p className="text-xs text-yellow-500 mt-0.5">
              Review and verify proof submissions
            </p>
          </div>
          <Link
            href="/admin/winners"
            className="text-xs bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg"
          >
            Review
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="glass rounded-2xl p-5 border border-white/5"
          >
            <div
              className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
