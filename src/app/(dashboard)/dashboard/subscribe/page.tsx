"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mockCreateSubscription } from "@/lib/mock-payment";
import { CreditCard, Check, Loader2, ShieldCheck } from "lucide-react";
import { cn, formatDate, getSubscriptionPrice } from "@/lib/utils";
import type { Subscription } from "@/types";
import toast from "react-hot-toast";

export default function SubscribePage() {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setSubscription(data);
      setFetching(false);
    }
    fetch();
  }, []);

  function formatCardNumber(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length >= 2 ? clean.slice(0, 2) + "/" + clean.slice(2) : clean;
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const result = await mockCreateSubscription(user.id, plan, {
      number: cardNumber,
      expiry,
      cvv,
    });

    if (!result.success) {
      toast.error(result.error || "Payment failed");
      setLoading(false);
      return;
    }

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (plan === "yearly" ? 12 : 1));

    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: result.customerId,
        stripe_subscription_id: result.subscriptionId,
        plan,
        status: "active",
        current_period_end: periodEnd.toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      toast.error("Failed to activate subscription");
    } else {
      toast.success("Subscription activated!");
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setSubscription(data);
    }
    setLoading(false);
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription?")) return;
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", user.id);

    toast.success("Subscription cancelled");
    setSubscription((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    setLoading(false);
  }

  if (fetching)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );

  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your GolfGives membership
        </p>
      </div>

      {/* Current status */}
      {subscription && (
        <div
          className={cn(
            "rounded-2xl p-5 border",
            isActive
              ? "bg-green-500/5 border-green-500/20"
              : "bg-white/3 border-white/5",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Current plan</p>
              <p className="text-lg font-bold text-white capitalize mt-0.5">
                {subscription.plan} —{" "}
                <span className={isActive ? "text-green-400" : "text-red-400"}>
                  {subscription.status}
                </span>
              </p>
              {isActive && subscription.current_period_end && (
                <p className="text-xs text-gray-500 mt-1">
                  Renews {formatDate(subscription.current_period_end)}
                </p>
              )}
            </div>
            {isActive && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg px-3 py-2 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {!isActive && (
        <>
          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-4">
            {(["monthly", "yearly"] as const).map((p) => (
              <div
                key={p}
                onClick={() => setPlan(p)}
                className={cn(
                  "rounded-2xl p-5 border cursor-pointer transition-all",
                  plan === p
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-white/8 glass hover:border-white/15",
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold capitalize">{p}</span>
                  {p === "yearly" && (
                    <span className="text-xs bg-green-500/20 text-green-400 rounded-full px-2 py-0.5">
                      Save 17%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">
                  ₹{getSubscriptionPrice(p).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  per {p === "monthly" ? "month" : "year"}
                </p>
                {[
                  "Draw entry every month",
                  p === "yearly" ? "2 months free" : "Cancel anytime",
                  "Charity contribution",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 mt-2">
                    <Check className="w-3 h-3 text-green-400 shrink-0" />
                    <span className="text-xs text-gray-400">{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Payment form */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-white">Payment details</h2>
            </div>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">
                  Card number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  required
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1.5">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    required
                    placeholder="MM/YY"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    required
                    placeholder="123"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all text-sm font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>Pay ₹{getSubscriptionPrice(plan).toLocaleString("en-IN")}</>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured with 256-bit SSL encryption
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
