"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Heart, Trophy, Target, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const STEPS = [
  {
    icon: Target,
    title: "Enter your scores",
    desc: "Log your latest Stableford scores after every round. Simple, fast, done.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Trophy,
    title: "Win monthly prizes",
    desc: "Match numbers drawn from the pool. 3, 4, or 5 matches — three tiers of prizes.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Heart,
    title: "Give to charity",
    desc: "Every subscription funds a cause you choose. Your game, your impact.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

const PLANS = [
  {
    name: "Monthly",
    price: "₹999",
    period: "/month",
    features: [
      "All 5 score slots",
      "Monthly draw entry",
      "Charity contribution",
      "Winner dashboard",
    ],
    highlight: false,
  },
  {
    name: "Yearly",
    price: "₹9,999",
    period: "/year",
    badge: "Save 17%",
    features: [
      "Everything in Monthly",
      "2 months free",
      "Priority winner verification",
      "Exclusive yearly badge",
    ],
    highlight: true,
  },
];

const STATS = [
  { value: "₹2.4L+", label: "Prizes paid out" },
  { value: "1,200+", label: "Active members" },
  { value: "18", label: "Charity partners" },
  { value: "₹48K+", label: "Donated to charity" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between glass border-b border-white/5">
        <span className="text-xl font-bold gradient-text">GolfGives</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-green-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-green-400 text-sm font-medium mb-8"
          >
            <Heart className="w-3.5 h-3.5" />
            Golf that gives back
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            Play golf.
            <br />
            <span className="gradient-text">Win prizes.</span>
            <br />
            Change lives.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Subscribe, log your Stableford scores, enter monthly prize draws,
            and automatically donate to a charity you believe in — all in one
            place.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-2xl transition-all text-lg glow-green"
            >
              Start for ₹999/month
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-6 py-4 text-sm"
            >
              How it works <ChevronDown className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-12 bg-linear-to-b from-transparent to-green-500/40 mx-auto" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three simple steps. One powerful habit.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 hover:border-white/15 transition-all"
              >
                <div
                  className={`w-12 h-12 ${step.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div className="text-xs text-gray-600 font-mono mb-2">
                  0{i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool breakdown */}
      <section className="py-24 px-6 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Monthly prize pool
            </h2>
            <p className="text-gray-400">Three ways to win every month</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                match: "5 numbers",
                share: "40%",
                label: "Jackpot",
                color: "border-yellow-500/30 bg-yellow-500/5",
                text: "text-yellow-400",
                rollover: true,
              },
              {
                match: "4 numbers",
                share: "35%",
                label: "Major prize",
                color: "border-green-500/30 bg-green-500/5",
                text: "text-green-400",
                rollover: false,
              },
              {
                match: "3 numbers",
                share: "25%",
                label: "Prize",
                color: "border-blue-500/30 bg-blue-500/5",
                text: "text-blue-400",
                rollover: false,
              },
            ].map((tier, i) => (
              <motion.div
                key={tier.match}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className={`rounded-2xl border p-6 ${tier.color}`}
              >
                <div className={`text-3xl font-bold ${tier.text} mb-1`}>
                  {tier.share}
                </div>
                <div className="text-white font-semibold">{tier.label}</div>
                <div className="text-gray-500 text-sm mt-1">
                  Match {tier.match}
                </div>
                {tier.rollover && (
                  <div className="mt-3 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-3 py-1 inline-block">
                    Jackpot rolls over if unclaimed
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple pricing
            </h2>
            <p className="text-gray-400">No hidden fees. Cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className={`rounded-2xl p-8 border transition-all ${
                  plan.highlight
                    ? "border-green-500/40 bg-green-500/5 glow-green"
                    : "border-white/8 glass"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold">{plan.name}</span>
                  {plan.badge && (
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all text-sm ${
                    plan.highlight
                      ? "bg-green-500 hover:bg-green-400 text-black"
                      : "border border-white/10 hover:border-white/20 text-white"
                  }`}
                >
                  Get started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 text-center border-t border-white/5">
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to play with <span className="gradient-text">purpose</span>?
          </h2>
          <p className="text-gray-400 mb-8">
            Join 1,200+ golfers who are winning prizes and changing lives every
            month.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-2xl transition-all text-lg"
          >
            Subscribe now <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        © 2026 GolfGives. Built with purpose.
      </footer>
    </main>
  );
}
