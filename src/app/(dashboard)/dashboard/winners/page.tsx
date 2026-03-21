"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Winner } from "@/types";
import toast from "react-hot-toast";

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  async function fetchWinners() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("winners")
      .select("*, draws(month_year)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWinners((data as Winner[]) ?? []);
    setFetching(false);
  }

  useEffect(() => {
    fetchWinners();
  }, []);

  async function handleProofUpload(winnerId: string, file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large — max 5MB");
      return;
    }
    setUploading(winnerId);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const path = `${user.id}/${winnerId}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("winner-proofs")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("winner-proofs")
      .getPublicUrl(path);

    await supabase
      .from("winners")
      .update({
        proof_url: urlData.publicUrl,
        status: "proof_submitted",
      })
      .eq("id", winnerId);

    toast.success("Proof uploaded! Admin will verify shortly.");
    fetchWinners();
    setUploading(null);
  }

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

  const statusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Trophy className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (fetching)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Winnings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload proof to claim your prizes
        </p>
      </div>

      {winners.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/5">
          <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No winnings yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Keep entering draws — your win is coming!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {statusIcon(winner.status)}
                  <div>
                    <p className="font-semibold text-white">
                      {winner.match_count}-number match
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(winner.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-400">
                    {formatCurrency(Number(winner.prize_amount))}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusColor(winner.status)}`}
                  >
                    {winner.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {winner.status === "pending" && (
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center">
                  <Upload className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-3">
                    Upload screenshot of your scores to claim prize
                  </p>
                  <label className="cursor-pointer">
                    <span className="bg-green-500 hover:bg-green-400 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-all inline-flex items-center gap-2">
                      {uploading === winner.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />{" "}
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" /> Choose file
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={uploading === winner.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProofUpload(winner.id, file);
                      }}
                    />
                  </label>
                </div>
              )}

              {winner.status === "proof_submitted" && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-purple-400">
                    Proof submitted — admin review in progress
                  </p>
                </div>
              )}

              {winner.status === "verified" && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-400">
                    Verified! Payment will be processed shortly.
                  </p>
                </div>
              )}

              {winner.status === "paid" && winner.paid_at && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-400">
                    Paid on {formatDate(winner.paid_at)}
                  </p>
                </div>
              )}

              {winner.status === "rejected" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-400">
                    Proof rejected — please contact support
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
