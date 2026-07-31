# ACAS Casino — Premium Mobile Casino Web App

Production-ready mobile-first casino built with React + Vite, Supabase, and a premium dark/gold design system.

## Tech Stack

- **React 18 + Vite 5 + TypeScript**
- **Tailwind CSS** with custom gold/luxury design tokens
- **Framer Motion** animations
- **TanStack Query** data fetching
- **React Hook Form + Zod** validation
- **Supabase** (Auth, Postgres, RLS, Realtime, Storage)
- **vite-plugin-pwa** for offline support

## Quick Start

```bash
npm install
cp .env.example .env   # fill in Supabase URL + anon key
npm run dev
```

Build for production: `npm run build` → deploy `dist/` to Vercel (vercel.json included).

## Supabase Schema

Tables (all with RLS + policies + indexes + triggers + realtime):

| Table | Purpose |
|---|---|
| `profiles` | User profiles, stats, VIP link, referrals |
| `wallets` | Balance + bonus balance (realtime) |
| `transactions` | Deposits / withdrawals / bets / wins / bonuses |
| `games` | 14 game catalog (seed included) |
| `game_history` | Every played round with result data |
| `leaderboard` | Daily / weekly / monthly / all-time rankings |
| `notifications` | Push-style in-app notifications (realtime) |
| `vip_levels` | 5 VIP tiers with cashback & bonuses |
| `achievements` + `user_achievements` | Achievement system |
| `admin_users` | Admin roles & permissions |

Key server-side functions:

- `place_bet(game_slug, amount)` — atomic balance deduction
- `settle_game(...)` — records history + credits winnings
- `handle_new_user` trigger — auto-creates profile/wallet on signup
- `apply_deposit_bonus` trigger — +10% bonus on completed deposits

## Auth Flows

Register (email verification) → Login → Forgot/Reset password → Session persistence → Protected routes. Admin portal at `/admin/login` (promote via `make_admin(user_id, 'admin')`).

## Games (14)

Mines, Roulette, Dice, Coin Flip, Plinko, Wheel Spin, Crash, Hi-Lo, Keno, Dragon Tower, Blackjack, Poker, Baccarat, Slots.

## Admin Panel

Overview analytics, user management (ban / balance adjust), wallet overview, transactions, game toggles, broadcast notifications, VIP management.

## Deployment

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel env vars.
2. Push to GitHub and import into Vercel — zero config (SPA rewrites in `vercel.json`).
