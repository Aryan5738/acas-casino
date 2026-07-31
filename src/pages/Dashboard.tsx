import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, Gift, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useGames, useGameHistory, useTransactions } from "@/hooks/useGames";
import { Header } from "@/components/layout/Header";
import { formatCurrency, getInitials, formatTimeAgo } from "@/lib/utils";
import type { Game } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, vipLevel } = useAuth();
  const { wallet } = useWallet();
  const { data: games } = useGames();
  const { data: history } = useGameHistory(user?.id, 5);
  const { data: transactions } = useTransactions(user?.id, 3);

  const featured = (games ?? []).filter((g) => g.is_featured);
  const rest = (games ?? []).filter((g) => !g.is_featured);

  const GameCard = ({ game, large }: { game: Game; large?: boolean }) => (
    <button
      onClick={() => navigate(`/games/${game.slug}`)}
      className={`glass relative overflow-hidden rounded-2xl p-4 text-left transition-transform active:scale-[0.97] ${
        large ? "min-w-[170px]" : "w-28 shrink-0"
      }`}
    >
      <div className={`bg-gradient-to-br ${game.gradient ?? "from-gold-500 to-gold-700"} absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl`} />
      <div className={`flex ${large ? "h-14 w-14" : "h-10 w-10"} items-center justify-center rounded-xl border border-white/10 bg-black/40 text-2xl`}>
        {game.icon}
      </div>
      <h3 className={`${large ? "mt-3 text-base" : "mt-2 text-xs"} font-bold leading-tight`}>{game.name}</h3>
      <p className="mt-0.5 text-[10px] text-muted-foreground">RTP {game.rtp}%</p>
    </button>
  );

  return (
    <div>
      <Header />
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-700 text-sm font-bold text-black">
            {getInitials(profile?.username ?? profile?.full_name)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Welcome back,</p>
            <h2 className="truncate text-sm font-bold">{profile?.username ?? "Player"}</h2>
          </div>
          {vipLevel && (
            <span className="ml-auto rounded-full border border-gold-500/40 bg-gold-500/10 px-2.5 py-1 text-[10px] font-bold text-gold-300">
              {vipLevel.icon} {vipLevel.name}
            </span>
          )}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/wallet")}
          className="relative mt-4 w-full overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-black/80 to-black/60 p-5 text-left shadow-glow backdrop-blur-xl"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-500/20 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-400/80">Available Balance</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            <span className="text-gradient-gold">₹{wallet ? wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</span>
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              Bonus: ₹{wallet?.bonus_balance.toFixed(2) ?? "0.00"}
            </span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </div>
        </motion.button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/wallet?tab=deposit")}
            className="glass flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-transform active:scale-[0.97]"
          >
            <ArrowDownToLine className="h-4 w-4 text-emerald-400" /> Deposit
          </button>
          <button
            onClick={() => navigate("/wallet?tab=withdraw")}
            className="glass flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-transform active:scale-[0.97]"
          >
            <ArrowUpFromLine className="h-4 w-4 text-gold-400" /> Withdraw
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider">Featured Games</h3>
          <button onClick={() => navigate("/games")} className="text-xs font-semibold text-gold-400">
            View all
          </button>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {featured.map((g) => (
            <GameCard key={g.id} game={g} large />
          ))}
        </div>

        <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {rest.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>

        <button
          onClick={() => navigate("/promotions")}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-gold-500/25 bg-gradient-to-r from-gold-500/15 to-transparent p-4 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/20">
            <Gift className="h-5 w-5 text-gold-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Welcome Bonus</h4>
            <p className="text-xs text-muted-foreground">Get 10% bonus on your first deposit</p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 text-gold-400" />
        </button>

        <div className="mt-6 space-y-4">
          {history && history.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Recent Games</h3>
              <div className="mt-2 space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="glass flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <span className="text-lg">{h.games?.icon ?? "🎮"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold">{h.games?.name ?? h.game_slug}</p>
                      <p className="text-[10px] text-muted-foreground">{formatTimeAgo(h.created_at)}</p>
                    </div>
                    <span className={`text-xs font-bold ${h.result === "win" ? "text-emerald-400" : "text-red-400"}`}>
                      {h.result === "win" ? `+₹${h.payout.toFixed(2)}` : `-₹${h.bet_amount.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transactions && transactions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Transactions</h3>
              <div className="mt-2 space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="glass flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <span className="text-lg">{t.type === "deposit" ? "📥" : t.type === "withdraw" ? "📤" : "🎲"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold capitalize">{t.type}</p>
                      <p className="text-[10px] text-muted-foreground">{formatTimeAgo(t.created_at)}</p>
                    </div>
                    <span className={`text-xs font-bold ${t.type === "withdraw" || t.type === "bet" ? "text-red-400" : "text-emerald-400"}`}>
                      {t.type === "withdraw" || t.type === "bet" ? "-" : "+"}₹{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
