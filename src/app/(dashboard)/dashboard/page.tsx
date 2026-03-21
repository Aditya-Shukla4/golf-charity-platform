import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Trophy, Target, Heart, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: subscription },
    { data: scores },
    { data: charitySelection },
    { data: wins },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    supabase
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false }),
    supabase
      .from("user_charity_selections")
      .select("*, charity:charities(*)")
      .eq("user_id", user.id)
      .single(),
    supabase.from("winners").select("*").eq("user_id", user.id),
  ]);

  const totalWon =
    wins?.reduce((sum, w) => sum + Number(w.prize_amount), 0) ?? 0;
  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(" ")[0] || "Golfer"} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's your GolfGives overview
        </p>
      </div>

      {/* Subscription alert */}
      {!isActive && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-300 font-medium">
              No active subscription
            </p>
            <p className="text-xs text-yellow-500 mt-0.5">
              Subscribe to enter draws and track scores
            </p>
          </div>
          <Link
            href="/dashboard/subscribe"
            className="text-xs bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg"
          >
            Subscribe
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: CreditCard,
            label: "Subscription",
            value: isActive ? subscription!.plan : "Inactive",
            sub:
              isActive && subscription?.current_period_end
                ? `Renews ${formatDate(subscription.current_period_end)}`
                : "Not subscribed",
            color: isActive ? "text-green-400" : "text-gray-500",
            bg: "bg-green-500/10",
          },
          {
            icon: Target,
            label: "Scores logged",
            value: `${scores?.length ?? 0}/5`,
            sub: scores?.[0]
              ? `Last: ${formatDate(scores[0].played_on)}`
              : "No scores yet",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            icon: Heart,
            label: "Charity",
            value: charitySelection?.charity
              ? (charitySelection.charity as { name: string }).name.split(
                  " ",
                )[0]
              : "None",
            sub: charitySelection
              ? `${charitySelection.contribution_pct}% contribution`
              : "Select a charity",
            color: "text-pink-400",
            bg: "bg-pink-500/10",
          },
          {
            icon: Trophy,
            label: "Total won",
            value: formatCurrency(totalWon),
            sub: `${wins?.length ?? 0} prize${wins?.length !== 1 ? "s" : ""} total`,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="glass rounded-2xl p-4 border border-white/5"
          >
            <div
              className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent scores */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent scores</h2>
          <Link
            href="/dashboard/scores"
            className="text-xs text-green-400 hover:text-green-300"
          >
            Manage →
          </Link>
        </div>
        {scores && scores.length > 0 ? (
          <div className="space-y-2">
            {scores.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-sm text-gray-400">
                  {formatDate(s.played_on)}
                </span>
                <span className="text-sm font-semibold text-white">
                  {s.score} pts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-4">
            No scores yet.{" "}
            <Link href="/dashboard/scores" className="text-green-400">
              Add your first score →
            </Link>
          </p>
        )}
      </div>

      {/* Wins */}
      {wins && wins.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-4">Your winnings</h2>
          <div className="space-y-2">
            {wins.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-white">
                    {w.match_count}-number match
                  </span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      w.status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : w.status === "verified"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <span className="text-sm font-bold text-yellow-400">
                  {formatCurrency(Number(w.prize_amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
