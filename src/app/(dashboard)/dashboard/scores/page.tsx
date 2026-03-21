"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Loader2, Target } from "lucide-react";
import type { GolfScore } from "@/types";
import toast from "react-hot-toast";

export default function ScoresPage() {
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [score, setScore] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  async function fetchScores() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("golf_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false });
    setScores(data ?? []);
    setFetching(false);
  }

  useEffect(() => {
    fetchScores();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(score);
    if (val < 1 || val > 45) {
      toast.error("Score must be between 1 and 45");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("golf_scores").insert({
      user_id: user.id,
      score: val,
      played_on: playedOn,
    });

    if (error) {
      toast.error("Failed to add score");
    } else {
      toast.success("Score added!");
      setScore("");
      setPlayedOn("");
      fetchScores();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("golf_scores").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete score");
    } else {
      toast.success("Score removed");
      setScores((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Scores</h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your last 5 Stableford scores. A new score replaces the oldest
          automatically.
        </p>
      </div>

      {/* Score slots */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Your scores</h2>
          <span className="text-xs text-gray-500">
            {scores.length}/5 slots used
          </span>
        </div>

        {/* Slot indicators */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i < scores.length ? "bg-green-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No scores yet. Add your first round below.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {scores.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {s.score} pts
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      Stableford
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {formatDate(s.played_on)}
                  </span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add score form */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="font-semibold text-white mb-4">Add a score</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">
              Stableford score <span className="text-gray-600">(1–45)</span>
            </label>
            <input
              type="number"
              min={1}
              max={45}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              placeholder="e.g. 36"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">
              Date played
            </label>
            <input
              type="date"
              value={playedOn}
              onChange={(e) => setPlayedOn(e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all text-sm scheme-dark"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add score
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
