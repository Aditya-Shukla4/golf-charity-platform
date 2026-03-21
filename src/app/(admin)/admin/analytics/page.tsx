import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, Heart } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { count: monthlySubscribers },
    { count: yearlySubscribers },
    { data: winners },
    { data: charitySelections },
    { data: draws },
    { data: scores },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("plan", "monthly"),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("plan", "yearly"),
    supabase.from("winners").select("prize_amount, status"),
    supabase
      .from("user_charity_selections")
      .select("charity_id, contribution_pct, charities(name)"),
    supabase
      .from("draws")
      .select("month_year, jackpot_pool, four_match_pool, three_match_pool")
      .eq("status", "published"),
    supabase.from("golf_scores").select("score"),
  ]);

  const totalPaidOut =
    winners
      ?.filter((w) => w.status === "paid")
      .reduce((s, w) => s + Number(w.prize_amount), 0) ?? 0;
  const totalPending =
    winners
      ?.filter((w) => w.status !== "paid" && w.status !== "rejected")
      .reduce((s, w) => s + Number(w.prize_amount), 0) ?? 0;
  const monthlyRevenue = (monthlySubscribers ?? 0) * 999;
  const yearlyRevenue = (yearlySubscribers ?? 0) * 9999;
  const totalRevenue = monthlyRevenue + yearlyRevenue;

  const avgScore =
    scores && scores.length > 0
      ? (scores.reduce((s, sc) => s + sc.score, 0) / scores.length).toFixed(1)
      : "N/A";

  const charityBreakdown =
    charitySelections?.reduce(
      (acc, sel) => {
        const charityData = sel.charities as unknown as { name: string } | null;
        const name = charityData?.name ?? "Unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) ?? {};

  const topCharities = Object.entries(charityBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    {
      label: "Total revenue",
      value: formatCurrency(totalRevenue),
      sub: "All subscriptions",
      color: "text-green-400",
      bg: "bg-green-500/10",
      icon: TrendingUp,
    },
    {
      label: "Monthly subs revenue",
      value: formatCurrency(monthlyRevenue),
      sub: `${monthlySubscribers ?? 0} subscribers`,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      icon: Users,
    },
    {
      label: "Yearly subs revenue",
      value: formatCurrency(yearlyRevenue),
      sub: `${yearlySubscribers ?? 0} subscribers`,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      icon: Users,
    },
    {
      label: "Prizes paid out",
      value: formatCurrency(totalPaidOut),
      sub: `${formatCurrency(totalPending)} pending`,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">
          Platform performance overview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-5 border border-white/5"
          >
            <div
              className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription split */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-4">Subscription split</h2>
          <div className="space-y-3">
            {[
              {
                label: "Monthly",
                count: monthlySubscribers ?? 0,
                total: activeSubscribers ?? 0,
                color: "bg-blue-500",
              },
              {
                label: "Yearly",
                count: yearlySubscribers ?? 0,
                total: activeSubscribers ?? 0,
                color: "bg-purple-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{
                      width:
                        item.total > 0
                          ? `${(item.count / item.total) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-600 pt-1">
              {totalUsers ?? 0} total users · {activeSubscribers ?? 0} active
            </p>
          </div>
        </div>

        {/* Top charities */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-pink-400" />
            <h2 className="font-semibold text-white">Top charities</h2>
          </div>
          {topCharities.length === 0 ? (
            <p className="text-sm text-gray-600">No selections yet</p>
          ) : (
            <div className="space-y-3">
              {topCharities.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 truncate">{name}</span>
                    <span className="text-white font-medium ml-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{
                        width: `${(count / (charitySelections?.length || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score stats */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-4">Score statistics</h2>
          <div className="space-y-3">
            {[
              {
                label: "Total scores logged",
                value: String(scores?.length ?? 0),
              },
              { label: "Average score", value: avgScore },
              {
                label: "Highest score",
                value:
                  scores && scores.length > 0
                    ? String(Math.max(...scores.map((s) => s.score)))
                    : "N/A",
              },
              {
                label: "Lowest score",
                value:
                  scores && scores.length > 0
                    ? String(Math.min(...scores.map((s) => s.score)))
                    : "N/A",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className="text-sm font-semibold text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Draw history */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-4">Draw history</h2>
          {!draws || draws.length === 0 ? (
            <p className="text-sm text-gray-600">No draws published yet</p>
          ) : (
            <div className="space-y-2">
              {draws.slice(0, 5).map((draw) => (
                <div
                  key={draw.month_year}
                  className="flex justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-gray-400">
                    {draw.month_year}
                  </span>
                  <span className="text-sm font-medium text-yellow-400">
                    {formatCurrency(
                      Number(draw.jackpot_pool) +
                        Number(draw.four_match_pool) +
                        Number(draw.three_match_pool),
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
