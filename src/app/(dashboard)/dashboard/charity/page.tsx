"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, ExternalLink, Loader2, Check } from "lucide-react";
import type { Charity } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [contributionPct, setContributionPct] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: chars }, { data: sel }] = await Promise.all([
        supabase
          .from("charities")
          .select("*")
          .eq("is_active", true)
          .order("is_featured", { ascending: false }),
        supabase
          .from("user_charity_selections")
          .select("*")
          .eq("user_id", user.id)
          .single(),
      ]);

      setCharities(chars ?? []);
      if (sel) {
        setSelected(sel.charity_id);
        setContributionPct(sel.contribution_pct);
      }
      setFetching(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!selected) {
      toast.error("Please select a charity");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_charity_selections")
      .upsert(
        {
          user_id: user.id,
          charity_id: selected,
          contribution_pct: contributionPct,
          selected_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (error) toast.error("Failed to save");
    else toast.success("Charity selection saved!");
    setLoading(false);
  }

  const filtered = charities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (fetching)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Charity</h1>
        <p className="text-gray-400 text-sm mt-1">
          Choose a charity to support. A portion of your subscription goes
          directly to them.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Contribution percentage</h2>
          <span className="text-2xl font-bold text-green-400">
            {contributionPct}%
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={50}
          step={5}
          value={contributionPct}
          onChange={(e) => setContributionPct(Number(e.target.value))}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>10% (minimum)</span>
          <span>50%</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          At 10% on monthly plan:{" "}
          <span className="text-green-400 font-medium">₹99.90/month</span> goes
          to your charity
        </p>
      </div>

      <input
        type="text"
        placeholder="Search charities..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No charities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((charity) => (
            <div
              key={charity.id}
              onClick={() => setSelected(charity.id)}
              className={cn(
                "glass rounded-2xl p-5 border cursor-pointer transition-all",
                selected === charity.id
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-white/5 hover:border-white/15",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">
                      {charity.name}
                    </h3>
                    {charity.is_featured && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">
                        Featured
                      </span>
                    )}
                  </div>
                  {charity.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                      {charity.description}
                    </p>
                  )}
                  {charity.website_url && (
                    <span
                      className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 mt-2 cursor-pointer"
                      onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                        e.stopPropagation();
                        window.open(charity.website_url!, "_blank");
                      }}
                    >
                      Visit website <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    selected === charity.id
                      ? "border-green-500 bg-green-500"
                      : "border-white/20",
                  )}
                >
                  {selected === charity.id && (
                    <Check className="w-3.5 h-3.5 text-black" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !selected}
        className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" /> Save selection
          </>
        )}
      </button>
    </div>
  );
}
