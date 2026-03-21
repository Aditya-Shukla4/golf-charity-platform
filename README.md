# GolfGives — Golf Charity Subscription Platform

Live: https://golf-charity-platform-phi.vercel.app

## Overview
A subscription-based golf platform combining performance tracking, charity fundraising, and a monthly draw-based reward engine.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Mock payment system (Stripe-ready)
- **Deployment**: Vercel

## Architecture Decisions

### Rolling 5-score window
Handled via a Postgres trigger (`enforce_score_limit`) — not application code. This ensures the constraint holds regardless of how data is inserted.

### Score snapshot in draw entries
When a draw runs, user scores are copied into `score_snapshot`. This means scores can change after draw entry without affecting results — correct and auditable.

### Draw engine
Two modes supported:
- **Random**: Standard lottery — 5 unique numbers from 1–45
- **Algorithmic**: Weighted by score frequency across all entries — numbers that appear most in user scores have higher probability

### Prize pool calculation
- 5-match: 40% of pool (jackpot rolls over if unclaimed)
- 4-match: 35% of pool
- 3-match: 25% of pool

### Row Level Security
All tables have RLS enabled. Users can only access their own data. Admin operations use service role key server-side.

## Database Schema
9 tables: users, subscriptions, golf_scores, charities, user_charity_selections, draws, draw_entries, winners, prize_pool_config

## Features
- Subscription management (monthly/yearly)
- Rolling 5-score Stableford tracking
- Monthly draw system with simulation mode
- Charity selection with adjustable contribution %
- Winner verification workflow
- Full admin dashboard with analytics

## Test Credentials
- User: signup at /signup
- Admin: set role = 'admin' in Supabase users table

## Local Setup
```bash
git clone https://github.com/Aditya-Shukla4/golf-charity-platform
cd golf-charity-platform
npm install
cp .env.local.example .env.local
# Fill in Supabase + Stripe keys
npm run dev
```

## PRD Compliance
- Subscription engine with monthly/yearly plans
- Score entry — 5-score rolling logic with Postgres trigger
- Draw system — random + algorithmic modes
- Charity integration — min 10% contribution
- Winner verification flow
- Admin dashboard — full control
- Mobile-first responsive design
