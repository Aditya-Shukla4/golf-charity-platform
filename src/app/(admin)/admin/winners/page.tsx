"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckSquare,
  Loader2,
  CheckCircle2,
  XCircle,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface WinnerWithDetails {
  id: string;
  draw_id: string;
  user_id: string;
  match_count: number;
  prize_amount: number;
  status: string;
  proof_url: string | null;
  verified_at: string | null;
  paid_at: string | null;
  created_at: string;
  users: { full_name: string | null; email: string } | null;
  draws: { month_year: string } | null;
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<WinnerWithDetails[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "paid">(
    "all",
  );

  async function fetchWinners() {
    const supabase = createClient();
    const { data } = await supabase
      .from("winners")
      .select("*, users(full_name, email), draws(month_year)")
      .order("created_at", { ascending: false });
    setWinners((data as WinnerWithDetails[]) ?? []);
    setFetching(false);
  }

  useEffect(() => {
    fetchWinners();
  }, []);

  async function handleVerify(id: string) {
    const supabase = createClient();
    await supabase
      .from("winners")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("id", id);
    toast.success("Winner verified!");
    fetchWinners();
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this winner?")) return;
    const supabase = createClient();
    await supabase.from("winners").update({ status: "rejected" }).eq("id", id);
    toast.success("Winner rejected");
    fetchWinners();
  }

  async function handleMarkPaid(id: string) {
    const supabase = createClient();
    await supabase
      .from("winners")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", id);
    toast.success("Marked as paid!");
    fetchWinners();
  }

  const filtered = winners.filter((w) =>
    filter === "all" ? true : w.status === filter,
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400";
      case "verified":
        return "bg-blue-500/20 text-blue-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      case "proof_submitted":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Winners</h1>
        <p className="text-gray-400 text-sm mt-1">
          Verify submissions and manage payouts
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "verified", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-white/5">
          <CheckSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No winners found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((winner) => (
            <div
              key={winner.id}
              className="glass rounded-2xl p-5 border border-white/5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">
                      {winner.users?.full_name || "Unknown"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColor(winner.status)}`}
                    >
                      {winner.status}
                    </span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      {winner.match_count}-match
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{winner.users?.email}</p>
                  <p className="text-xs text-gray-600">
                    Draw: {winner.draws?.month_year} · Won:{" "}
                    {formatDate(winner.created_at)}
                  </p>
                  <p className="text-lg font-bold text-yellow-400">
                    {formatCurrency(Number(winner.prize_amount))}
                  </p>
                  {winner.proof_url && (
                    <span
                      className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                      onClick={() => window.open(winner.proof_url!, "_blank")}
                    >
                      View proof →
                    </span>
                  )}
                  {winner.verified_at && (
                    <p className="text-xs text-gray-600">
                      Verified: {formatDate(winner.verified_at)}
                    </p>
                  )}
                  {winner.paid_at && (
                    <p className="text-xs text-gray-600">
                      Paid: {formatDate(winner.paid_at)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {(winner.status === "pending" ||
                    winner.status === "proof_submitted") && (
                    <>
                      <button
                        onClick={() => handleVerify(winner.id)}
                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button
                        onClick={() => handleReject(winner.id)}
                        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {winner.status === "verified" && (
                    <button
                      onClick={() => handleMarkPaid(winner.id)}
                      className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Mark paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
