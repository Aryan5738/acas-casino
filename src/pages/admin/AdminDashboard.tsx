import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Wallet as WalletIcon, ArrowLeftRight, BarChart3,
  Gamepad2, Bell, Crown, LogOut, TrendingUp, TrendingDown, Search, Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PageContainer } from "@/components/layout/PageContainer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatDateTime, formatCompact } from "@/lib/utils";

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "wallets", label: "Wallets", icon: WalletIcon },
  { key: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "games", label: "Games", icon: Gamepad2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "vip", label: "VIP Levels", icon: Crown },
];

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, tx, hist, wallets] = await Promise.all([
        supabase.from("profiles").select("count").maybeSingle().then(() => supabase.from("profiles").select("id")),
        supabase.from("transactions").select("amount, type, status"),
        supabase.from("game_history").select("bet_amount, payout"),
        supabase.from("wallets").select("balance"),
      ]);
      const txData = tx.data ?? [];
      const histData = hist.data ?? [];
      const depositTotal = txData.filter((t) => t.type === "deposit" && t.status === "completed").reduce((a, t) => a + t.amount, 0);
      const withdrawTotal = txData.filter((t) => t.type === "withdraw" && t.status === "completed").reduce((a, t) => a + t.amount, 0);
      const wagered = histData.reduce((a, t) => a + t.bet_amount, 0);
      const paidOut = histData.filter((h) => h.payout > 0).reduce((a, t) => a + t.payout, 0);
      const balance = (wallets.data ?? []).reduce((a, w) => a + w.balance, 0);
      return {
        users: users.data?.length ?? 0,
        deposits: depositTotal,
        withdrawals: withdrawTotal,
        wagered,
        paidOut,
        balance,
        profit: depositTotal - paidOut,
      };
    },
    staleTime: 30_000,
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      let q = supabase.from("profiles").select("*, wallets(*)").order("created_at", { ascending: false }).limit(50);
      if (search) q = q.ilike("username", `%${search}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: games } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: vipLevels } = useQuery({
    queryKey: ["admin-vip"],
    queryFn: async () => {
      const { data } = await supabase.from("vip_levels").select("*").order("level");
      return data ?? [];
    },
  });

  const toggleUserBan = async (id: string, banned: boolean) => {
    await supabase.from("profiles").update({ is_banned: !banned }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const toggleGame = async (id: string, active: boolean) => {
    await supabase.from("games").update({ is_active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-games"] });
  };

  const adjustBalance = async (userId: string, delta: number, reason: string) => {
    await supabase.from("wallets").select("*").eq("user_id", userId).single().then(async ({ data: w }) => {
      if (!w) return;
      const newBal = Math.max(0, w.balance + delta);
      await supabase.from("wallets").update({ balance: newBal }).eq("user_id", userId);
      await supabase.rpc("wallet_transaction", {
        p_user_id: userId, p_type: "adjustment", p_amount: Math.abs(delta),
        p_balance_after: newBal, p_status: "completed",
        p_reference: `ADJ-${Date.now()}`, p_metadata: { reason, admin: profile?.username },
      });
    });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const sendBroadcast = async (title: string, body: string) => {
    const { data: all } = await supabase.from("profiles").select("id").limit(5000);
    if (!all) return;
    await supabase.from("notifications").insert(
      all.map((u) => ({ user_id: u.id, title, body, type: "promo" })),
    );
  };

  const statCards = [
    { label: "Total Users", value: formatCompact(stats?.users ?? 0), icon: Users, color: "text-blue-400" },
    { label: "Total Deposits", value: formatCurrency(stats?.deposits ?? 0), icon: TrendingDown, color: "text-emerald-400" },
    { label: "Total Withdrawals", value: formatCurrency(stats?.withdrawals ?? 0), icon: TrendingUp, color: "text-red-400" },
    { label: "Total Wagered", value: formatCurrency(stats?.wagered ?? 0), icon: Gamepad2, color: "text-gold-400" },
    { label: "Paid Out", value: formatCurrency(stats?.paidOut ?? 0), icon: WalletIcon, color: "text-purple-400" },
    { label: "House Profit", value: formatCurrency(stats?.profit ?? 0), icon: BarChart3, color: "text-cyan-400" },
  ];

  const renderTab = () => {
    switch (tab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4">
                  <s.icon className={cn("h-4 w-4", s.color)} />
                  <p className="mt-2 text-lg font-extrabold">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider">Revenue Split</p>
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px]"><span className="text-emerald-400">Deposits</span><span>{formatCurrency(stats?.deposits ?? 0)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]"><span className="text-red-400">Payouts</span><span>{formatCurrency(stats?.paidOut ?? 0)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, ((stats?.paidOut ?? 0) / Math.max(1, stats?.deposits ?? 1)) * 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]"><span className="text-gold-400">House Profit</span><span>{formatCurrency(stats?.profit ?? 0)}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600" style={{ width: `${Math.max(5, Math.min(100, ((stats?.profit ?? 0) / Math.max(1, stats?.deposits ?? 1)) * 100))}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {users?.map((u) => (
              <div key={u.id} className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                    {u.username?.slice(0, 2).toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {u.username ?? "Unknown"} {u.is_banned && <span className="text-[9px] text-red-400">BANNED</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Joined {formatDateTime(u.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gold-300">₹{((u.wallets as unknown as { balance?: number }[])?.[0]?.balance ?? 0).toLocaleString("en-IN")}</p>
                    <p className="text-[9px] text-muted-foreground">{u.games_played} games</p>
                  </div>
                </div>
                <div className="mt-2.5 flex gap-2">
                  <button onClick={() => adjustBalance(u.id, 1000, "Admin bonus")} className="flex-1 rounded-lg bg-emerald-500/15 py-1.5 text-[10px] font-bold text-emerald-400">+₹1,000</button>
                  <button onClick={() => adjustBalance(u.id, -1000, "Admin deduction")} className="flex-1 rounded-lg bg-red-500/15 py-1.5 text-[10px] font-bold text-red-400">-₹1,000</button>
                  <button onClick={() => toggleUserBan(u.id, u.is_banned)} className={cn("flex-1 rounded-lg py-1.5 text-[10px] font-bold", u.is_banned ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-foreground")}>
                    {u.is_banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </div>
            ))}
            {users?.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No users found</p>}
          </div>
        );

      case "wallets":
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">House balance: <span className="font-bold text-gold-300">{formatCurrency(stats?.balance ?? 0)}</span></p>
            {users?.map((u) => {
              const w = (u.wallets as unknown as { balance?: number; bonus_balance?: number; is_frozen?: boolean }[])?.[0];
              return (
                <div key={u.id} className="glass flex items-center gap-3 rounded-xl p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{u.username?.slice(0, 2).toUpperCase() ?? "U"}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{u.username}</p>
                    <p className="text-[10px] text-muted-foreground">Bonus: ₹{w?.bonus_balance?.toFixed(2) ?? "0.00"}</p>
                  </div>
                  <p className="text-sm font-extrabold text-gold-300">₹{w?.balance?.toLocaleString("en-IN", { maximumFractionDigits: 0 }) ?? "0"}</p>
                </div>
              );
            })}
          </div>
        );

      case "transactions":
        return (
          <div className="space-y-2">
            {transactions?.map((t) => (
              <div key={t.id} className="glass flex items-center gap-3 rounded-xl px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold capitalize">{t.type} <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-muted-foreground">{t.status}</span></p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{formatDateTime(t.created_at)} · {t.reference ?? t.id.slice(0, 8)}</p>
                </div>
                <span className={cn("text-sm font-bold", t.type === "deposit" || t.type === "win" || t.type === "bonus" ? "text-emerald-400" : "text-red-400")}>
                  {t.type === "deposit" || t.type === "win" || t.type === "bonus" ? "+" : "-"}₹{t.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {transactions?.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No transactions</p>}
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Win Rate</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-400">48.2%</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Bet</p>
                <p className="mt-1 text-2xl font-extrabold text-gold-300">₹{(stats?.wagered ?? 0) / Math.max(1, stats?.users ?? 1) > 0 ? formatCompact((stats?.wagered ?? 0) / Math.max(1, stats?.users ?? 1)) : "0"}</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider">Daily Activity (7d)</p>
              <div className="mt-4 flex h-32 items-end gap-2">
                {[35, 55, 40, 70, 60, 85, 65].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-gradient-to-t from-gold-600 to-gold-400 transition-all duration-700" style={{ height: `${h}%` }} />
                    <span className="text-[8px] text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "games":
        return (
          <div className="space-y-2">
            {games?.map((g) => (
              <div key={g.id} className="glass flex items-center gap-3 rounded-xl p-3.5">
                <span className="text-xl">{g.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground">{g.rtp}% RTP · {g.category}</p>
                </div>
                <button
                  onClick={() => toggleGame(g.id, g.is_active)}
                  className={cn("rounded-full px-3 py-1 text-[10px] font-bold", g.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}
                >
                  {g.is_active ? "Active" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        );

      case "notifications":
        return <BroadcastForm onSend={sendBroadcast} />;

      case "vip":
        return (
          <div className="space-y-3">
            {vipLevels?.map((v) => (
              <div key={v.id} className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{v.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{v.name} <span className="text-[10px] text-muted-foreground">Lv.{v.level}</span></p>
                    <p className="text-[10px] text-muted-foreground">Min deposit: ₹{v.min_deposit.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right text-[10px]">
                    <p className="text-emerald-400">{v.cashback_pct}% cashback</p>
                    <p className="text-gold-400">{v.bonus_pct}% bonus</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {v.perks.map((p) => (
                    <span key={p} className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-muted-foreground">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <Shield className="h-5 w-5 text-gold-400" />
          <h1 className="text-base font-extrabold">Admin Panel</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400 sm:block">
              ● LIVE
            </span>
            <button
              onClick={async () => { await signOut(); navigate("/admin/login"); }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="no-scrollbar sticky top-14 z-20 flex gap-1.5 overflow-x-auto border-b border-white/5 bg-black/40 px-4 py-2 backdrop-blur-lg">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              tab === n.key ? "bg-gold-500 text-black" : "bg-white/5 text-muted-foreground",
            )}
          >
            <n.icon className="h-3.5 w-3.5" /> {n.label}
          </button>
        ))}
      </div>

      <PageContainer>{renderTab()}</PageContainer>
    </div>
  );
}

function BroadcastForm({ onSend }: { onSend: (title: string, body: string) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    await onSend(title.trim(), body.trim());
    setSent(true);
    setTitle("");
    setBody("");
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="glass space-y-3 rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-wider">Broadcast to all users</p>
      <Input placeholder="Title (e.g. New Promotion!)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input placeholder="Message body" value={body} onChange={(e) => setBody(e.target.value)} />
      <Button className="w-full" onClick={submit}>
        {sent ? "Sent ✓" : "Send Broadcast"}
      </Button>
    </div>
  );
}
