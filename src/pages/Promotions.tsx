import { motion } from "framer-motion";
import { Gift, Flame, Sparkles, BadgePercent, Crown, Megaphone, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";

const promotions = [
  {
    icon: Gift,
    title: "Welcome Bonus 10%",
    desc: "Get 10% instant bonus on your first deposit",
    gradient: "from-gold-400 to-amber-600",
    tag: "New Players",
    code: "WELCOME10",
  },
  {
    icon: Flame,
    title: "Daily Reload 5%",
    desc: "Claim 5% reload bonus every single day",
    gradient: "from-red-500 to-orange-600",
    tag: "Daily",
    code: "RELOAD5",
  },
  {
    icon: Sparkles,
    title: "Weekend Boost",
    desc: "25% extra winnings on all games every weekend",
    gradient: "from-purple-500 to-fuchsia-600",
    tag: "Weekend",
    code: "BOOST25",
  },
  {
    icon: Crown,
    title: "VIP Cashback",
    desc: "Up to 3% cashback for VIP members",
    gradient: "from-blue-500 to-cyan-600",
    tag: "VIP",
    code: "AUTO",
  },
  {
    icon: BadgePercent,
    title: "Lucky Hour",
    desc: "Double multiplier on Dice & Mines every 8 PM",
    gradient: "from-emerald-500 to-teal-600",
    tag: "Limited",
    code: "LUCKY1H",
  },
  {
    icon: Megaphone,
    title: "Refer & Earn",
    desc: "Get ₹500 for every friend you invite",
    gradient: "from-pink-500 to-rose-600",
    tag: "Referral",
    code: "REFER500",
  },
];

export default function Promotions() {
  return (
    <div>
      <Header title="Promotions" />
      <PageContainer className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-gold-500/30 p-5"
          style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,0,0,0.6))" }}
        >
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gold-500/20 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-400">Limited Time</p>
          <h2 className="mt-1 text-xl font-extrabold">Festive Mega Bonus</h2>
          <p className="mt-1 text-xs text-muted-foreground">Double deposit bonus + 50 free spins on Slots</p>
          <div className="mt-3 inline-block rounded-full bg-gold-500 px-4 py-1.5 text-xs font-bold text-black">
            MEGA2026
          </div>
        </motion.div>

        {promotions.map((p, i) => (
          <motion.button
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform active:scale-[0.98]"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} shadow-lg`}>
              <p.icon className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">{p.title}</h3>
                <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-400">
                  {p.tag}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.desc}</p>
              <p className="mt-1 font-mono text-[10px] text-gold-400/80">Code: {p.code}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </motion.button>
        ))}
      </PageContainer>
    </div>
  );
}
