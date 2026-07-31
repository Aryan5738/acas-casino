import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Settings, LogOut, ShieldCheck, Award, History, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useVipLevels, useAchievements, useGameHistory } from "@/hooks/useGames";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCompact, getInitials } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, vipLevel, signOut } = useAuth();
  const { wallet } = useWallet();
  const { data: vipLevels } = useVipLevels();
  const { data: achievements } = useAchievements(user?.id);
  const { data: history } = useGameHistory(user?.id, 1);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const currentLevel = vipLevel?.level ?? 1;
  const nextLevel = (vipLevels ?? []).find((v) => v.level === currentLevel + 1);
  const progress = nextLevel
    ? Math.min(100, (wallet?.balance ?? 0) / nextLevel.min_deposit * 100)
    : 100;

  const stats = [
    { label: "Balance", value: wallet ? formatCompact(wallet.balance) : "0" },
    { label: "Deposits", value: formatCompact(profile?.total_deposits ?? 0) },
    { label: "Wagered", value: formatCompact(profile?.total_wagered ?? 0) },
    { label: "Games", value: String(profile?.games_played ?? 0) },
  ];

  const menuItems = [
    { icon: History, label: "Game History", to: "/games" },
    { icon: Award, label: "Achievements", to: "/promotions" },
    { icon: Share2, label: "Referral", to: "/wallet" },
    { icon: ShieldCheck, label: "Admin Panel", to: "/admin", adminOnly: true },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <div>
      <Header title="Profile" showBalance={false} />
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass relative overflow-hidden rounded-2xl p-5 text-center"
        >
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold-500/15 blur-2xl" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-700 text-xl font-bold text-black">
            {getInitials(profile?.username ?? profile?.full_name)}
          </div>
          <h2 className="mt-3 text-lg font-bold">{profile?.username ?? "Player"}</h2>
          <p className="text-xs text-muted-foreground">{profile?.full_name ?? user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300">
            {vipLevel?.icon ?? "🥉"} {vipLevel?.name ?? "Bronze"} VIP
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>{vipLevel?.name ?? "Bronze"}</span>
              {nextLevel ? <span>Next: {nextLevel.name}</span> : <span>Max Level</span>}
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            {nextLevel && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                ₹{formatCompact(nextLevel.min_deposit)} deposits to unlock {nextLevel.name}
              </p>
            )}
          </div>
        </motion.div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-xl py-3 text-center">
              <p className="text-sm font-extrabold text-gold-300">₹{s.value}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {achievements && achievements.unlocked.size > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider">Achievements</h3>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {achievements.all
                .filter((a) => achievements.unlocked.has(a.id))
                .slice(0, 8)
                .map((a) => (
                  <div key={a.id} className="glass flex shrink-0 flex-col items-center rounded-xl px-3 py-2.5">
                    <span className="text-xl">{a.icon}</span>
                    <p className="mt-1 text-[9px] font-bold">{a.name}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2">
          {menuItems
            .filter((m) => !m.adminOnly)
            .map((m) => (
              <button
                key={m.label}
                onClick={() => navigate(m.to)}
                className="glass flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-transform active:scale-[0.98]"
              >
                <m.icon className="h-4 w-4 text-gold-400" />
                <span className="text-sm font-semibold">{m.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </button>
            ))}
        </div>

        <Button variant="destructive" className="mt-5 w-full" size="lg" onClick={() => setConfirmLogout(true)}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>

        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Account created {profile ? new Date(profile.created_at).toLocaleDateString() : ""} · {history?.length ?? 0}+ games
        </p>
      </PageContainer>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogHeader>
          <DialogTitle>Sign Out?</DialogTitle>
          <DialogDescription>You will need to log in again to continue playing.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmLogout(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={async () => {
              await signOut();
              navigate("/welcome");
            }}
          >
            Sign Out
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
