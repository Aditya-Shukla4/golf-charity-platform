"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { formatDate, checkMatchCount } from "@/lib/utils";
import type { Draw, DrawEntry } from "@/types";

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [entries, setEntries] = useState<DrawEntry[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: drawData }, { data: entryData }] = await Promise.all([
        supabase
          .from("draws")
          .select("*")
          .eq("status", "published")
          .order("drawn_at", { ascending: false }),
        supabase.from("draw_entries").select("*").eq("user_id", user.id),
      ]);

      setDraws(drawData ?? []);
      setEntries(entryData ?? []);
      setFetching(false);
    }
    load();
  }, []);

  function getUserEntry(drawId: string) {
    return entries.find((e) => e.draw_id === drawId);
  }

  function getMatchResult(draw: Draw, entry: DrawEntry) {
    if (!draw.winning_numbers) return null;
    return checkMatchCount(entry.score_snapshot, draw.winning_numbers);
  }

  if (fetching)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Monthly Draws</h1>
        <p className="text-gray-400 text-sm mt-1">
          Results from published draws. Match 3, 4, or 5 numbers to win.
        </p>
      </div>

      {/* How matching works */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            match: "3 numbers",
            prize: "25% pool",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
          },
          {
            match: "4 numbers",
            prize: "35% pool",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
          },
          {
            match: "5 numbers",
            prize: "40% jackpot",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border-yellow-500/20",
          },
        ].map((tier) => (
          <div key={tier.match} className={`rounded-xl border p-3 ${tier.bg}`}>
            <p className={`text-lg font-bold ${tier.color}`}>{tier.prize}</p>
            <p className="text-xs text-gray-500 mt-0.5">{tier.match}</p>
          </div>
        ))}
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No draws published yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Check back after the monthly draw runs
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw) => {
            const entry = getUserEntry(draw.id);
            const matchCount =
              entry && draw.winning_numbers
                ? getMatchResult(draw, entry)
                : null;
            const isWinner = matchCount !== null && matchCount >= 3;

            return (
              <div
                key={draw.id}
                className={`glass rounded-2xl p-6 border transition-all ${
                  isWinner
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-white">
                        Draw — {draw.month_year}
                      </span>
                      {isWinner && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Winner!
                        </span>
                      )}
                    </div>
                    {draw.drawn_at && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Drawn on {formatDate(draw.drawn_at)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 rounded-full px-2 py-1">
                    Published
                  </span>
                </div>

                {/* Winning numbers */}
                {draw.winning_numbers && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Winning numbers
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {draw.winning_numbers.map((num, i) => {
                        const isMatch = entry?.score_snapshot?.includes(num);
                        return (
                          <div
                            key={i}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                              isMatch
                                ? "bg-yellow-500 text-black"
                                : "bg-white/8 text-gray-400"
                            }`}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* User entry */}
                {entry ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Your scores entered
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {entry.score_snapshot.map((score, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                            draw.winning_numbers?.includes(score)
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-white/5 text-gray-500"
                          }`}
                        >
                          {score}
                        </div>
                      ))}
                    </div>
                    {matchCount !== null && (
                      <p
                        className={`text-sm mt-3 font-medium ${isWinner ? "text-yellow-400" : "text-gray-500"}`}
                      >
                        {isWinner
                          ? `You matched ${matchCount} numbers!`
                          : `You matched ${matchCount} number${matchCount !== 1 ? "s" : ""} — keep playing!`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 italic">
                    You were not entered in this draw
                  </p>
                )}

                {/* Pool breakdown */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
                  {[
                    {
                      label: "Jackpot pool",
                      value: draw.jackpot_pool,
                      rolled: draw.jackpot_rolled_over,
                    },
                    {
                      label: "4-match pool",
                      value: draw.four_match_pool,
                      rolled: false,
                    },
                    {
                      label: "3-match pool",
                      value: draw.three_match_pool,
                      rolled: false,
                    },
                  ].map((pool) => (
                    <div key={pool.label}>
                      <p className="text-xs text-gray-600">{pool.label}</p>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        ₹{Number(pool.value).toLocaleString("en-IN")}
                      </p>
                      {pool.rolled && (
                        <p className="text-xs text-yellow-500 mt-0.5">
                          Rolled over
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
