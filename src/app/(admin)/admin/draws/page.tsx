"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  formatCurrency,
} from "@/lib/utils";
import { Trophy, Play, Eye, Loader2, CheckCircle2, Zap } from "lucide-react";
import type { Draw } from "@/types";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [fetching, setFetching] = useState(true);
  const [running, setRunning] = useState(false);
  const [drawType, setDrawType] = useState<"random" | "algorithmic">("random");
  const [simResult, setSimResult] = useState<number[] | null>(null);

  async function fetchDraws() {
    const supabase = createClient();
    const { data } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false });
    setDraws(data ?? []);
    setFetching(false);
  }

  useEffect(() => {
    fetchDraws();
  }, []);

  async function handleSimulate() {
    setRunning(true);
    const supabase = createClient();

    let numbers: number[];
    if (drawType === "algorithmic") {
      const { data: entries } = await supabase
        .from("draw_entries")
        .select("score_snapshot");
      const snapshots = entries?.map((e) => e.score_snapshot as number[]) ?? [];
      numbers =
        snapshots.length > 0
          ? generateAlgorithmicDraw(snapshots)
          : generateRandomDraw();
    } else {
      numbers = generateRandomDraw();
    }

    setSimResult(numbers);
    toast.success(`Simulation complete: ${numbers.join(", ")}`);
    setRunning(false);
  }

  async function handleRunDraw() {
    if (!simResult) {
      toast.error("Run a simulation first");
      return;
    }
    if (!confirm("Publish this draw? This cannot be undone.")) return;
    setRunning(true);

    const supabase = createClient();
    const monthYear = format(new Date(), "yyyy-MM");

    // Check if draw exists for this month
    const { data: existing } = await supabase
      .from("draws")
      .select("id")
      .eq("month_year", monthYear)
      .single();

    const drawData = {
      month_year: monthYear,
      winning_numbers: simResult,
      status: "published",
      draw_type: drawType,
      drawn_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    };

    const { error } = existing
      ? await supabase.from("draws").update(drawData).eq("id", existing.id)
      : await supabase.from("draws").insert(drawData);

    if (error) {
      toast.error("Failed to publish draw");
    } else {
      toast.success("Draw published!");
      setSimResult(null);
      fetchDraws();
    }
    setRunning(false);
  }

  async function handlePublishExisting(drawId: string) {
    const supabase = createClient();
    await supabase
      .from("draws")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", drawId);
    toast.success("Draw published!");
    fetchDraws();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Draw Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          Run simulations and publish monthly draws
        </p>
      </div>

      {/* Draw control panel */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="font-semibold text-white mb-5">Run a draw</h2>

        {/* Draw type selector */}
        <div className="flex gap-3 mb-5">
          {(["random", "algorithmic"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setDrawType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                drawType === type
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
              }`}
            >
              {type === "random" ? (
                <Trophy className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {type === "random" ? "Random draw" : "Algorithmic draw"}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-5">
          {drawType === "random"
            ? "Standard lottery — 5 random numbers from 1–45"
            : "Weighted by score frequency — numbers that appear most in user scores have higher chance"}
        </p>

        {/* Simulation result */}
        {simResult && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-5">
            <p className="text-xs text-purple-400 mb-2 font-medium">
              Simulation result
            </p>
            <div className="flex gap-2">
              {simResult.map((num, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-sm font-bold text-purple-300"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSimulate}
            disabled={running}
            className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Simulate
          </button>
          <button
            onClick={handleRunDraw}
            disabled={running || !simResult}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-500/30 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Publish draw
          </button>
        </div>
      </div>

      {/* Previous draws */}
      <div>
        <h2 className="font-semibold text-white mb-4">All draws</h2>
        {fetching ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : draws.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-white/5">
            <Trophy className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No draws yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => (
              <div
                key={draw.id}
                className="glass rounded-2xl p-5 border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {draw.month_year}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          draw.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : draw.status === "simulated"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {draw.status}
                      </span>
                      <span className="text-xs text-gray-600 capitalize">
                        {draw.draw_type}
                      </span>
                    </div>
                    {draw.winning_numbers && (
                      <div className="flex gap-1.5 mt-2">
                        {draw.winning_numbers.map((n, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>
                        Jackpot: {formatCurrency(Number(draw.jackpot_pool))}
                      </span>
                      <span>
                        4-match: {formatCurrency(Number(draw.four_match_pool))}
                      </span>
                      <span>
                        3-match: {formatCurrency(Number(draw.three_match_pool))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {draw.status === "published" && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {draw.status !== "published" && (
                      <button
                        onClick={() => handlePublishExisting(draw.id)}
                        className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
