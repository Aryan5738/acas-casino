import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, Coins } from "lucide-react";

const features = [
  { icon: Sparkles, title: "14 Premium Games", desc: "Mines, Crash, Roulette & more" },
  { icon: Shield, title: "Provably Secure", desc: "Bank-grade encryption & RLS" },
  { icon: Zap, title: "Instant Withdrawals", desc: "Get your winnings in seconds" },
  { icon: Coins, title: "VIP Rewards", desc: "Up to 12% deposit bonus" },
];

export default function Welcome() {
  return (
    <div className="relative flex min-h-screen flex-col bg-premium-dark px-6 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gold-500/40 bg-black/60 shadow-glow backdrop-blur-xl">
          <span className="font-display text-4xl font-bold text-gradient-gold">A</span>
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
          <span className="text-gradient-gold">ACAS</span> Casino
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          Where luxury meets luck. India's most premium mobile casino experience.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="mt-10 grid grid-cols-2 gap-3"
      >
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass rounded-xl p-4">
            <Icon className="h-5 w-5 text-gold-400" />
            <h3 className="mt-2 text-sm font-bold">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pb-10 pt-8"
      >
        <Link to="/register" className="btn-gold flex h-12 w-full items-center justify-center rounded-xl text-base">
          Get Started
        </Link>
        <Link
          to="/login"
          className="btn-ghost-gold mt-3 flex h-12 w-full items-center justify-center rounded-xl text-base"
        >
          I already have an account
        </Link>
        <p className="mt-6 text-center text-[10px] leading-relaxed text-muted-foreground">
          18+ | Play responsibly | T&C apply
        </p>
      </motion.div>
    </div>
  );
}
