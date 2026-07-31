import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const fired = useRef(false);

  useEffect(() => {
    if (loading || fired.current) return;
    fired.current = true;
    const t = setTimeout(() => {
      navigate(user ? "/dashboard" : "/welcome", { replace: true });
    }, 2200);
    return () => clearTimeout(t);
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-premium-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-gold-500/40 bg-black/60 shadow-glow-lg backdrop-blur-xl">
          <span className="font-display text-6xl font-bold text-gradient-gold">A</span>
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-6 text-3xl font-extrabold tracking-[0.3em]"
      >
        <span className="text-gradient-gold">ACAS</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-2 text-xs uppercase tracking-[0.4em] text-muted-foreground"
      >
        Royal Casino Experience
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-10 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-gold-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
