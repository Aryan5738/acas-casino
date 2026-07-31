import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CoinFlip() {
  const engine = useGameEngine({ slug: "coinflip" });
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ side: "heads" | "tails"; win: boolean; payout: number } | null>(null);

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setFlipping(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    const side: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const win = side === choice;
    const payout = win ? bet * 1.97 : 0;
    setResult({ side, win, payout });
    await engine.settle({ betAmount: bet, payout, result: win ? "win" : "loss", data: { side, choice } });
    setFlipping(false);
  };

  return (
    <GameLayout slug="coinflip">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="flex flex-col items-center py-6">
        <div className="relative h-44 w-44">
          <motion.div
            key={result?.side ?? "idle"}
            animate={flipping ? { rotateY: [0, 540, 1080, 1620, 2160], scale: [1, 0.9, 1.05, 0.95, 1] } : { rotateY: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className={cn(
              "flex h-44 w-44 items-center justify-center rounded-full border-4 text-6xl shadow-2xl",
              result
                ? result.win
                  ? "border-emerald-400/60 bg-gradient-to-br from-emerald-500/30 to-black shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                  : "border-red-400/60 bg-gradient-to-br from-red-500/30 to-black shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                : "border-gold-400/60 bg-gradient-to-br from-gold-400/30 to-black shadow-glow-lg",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {result ? (result.side === "heads" ? "👑" : "🪙") : flipping ? <span className="animate-pulse text-4xl">🔄</span> : choice === "heads" ? "👑" : "🪙"}
          </motion.div>
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("mt-6 text-lg font-extrabold", result.win ? "text-emerald-400" : "text-red-400")}
          >
            {result.side === "heads" ? "Heads! 👑" : "Tails! 🪙"} — {result.win ? `+₹${result.payout.toFixed(2)}` : "Lost"}
          </motion.p>
        )}
      </div>

      <div className="rounded-2xl glass p-4">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setChoice("heads")}
            className={cn(
              "rounded-xl border py-4 text-center transition-all",
              choice === "heads" ? "border-gold-500/60 bg-gold-500/20 shadow-glow" : "border-white/10 bg-white/5",
            )}
          >
            <span className="text-3xl">👑</span>
            <p className={cn("mt-1 text-sm font-bold", choice === "heads" ? "text-gold-300" : "text-muted-foreground")}>Heads</p>
          </button>
          <button
            onClick={() => setChoice("tails")}
            className={cn(
              "rounded-xl border py-4 text-center transition-all",
              choice === "tails" ? "border-gold-500/60 bg-gold-500/20 shadow-glow" : "border-white/10 bg-white/5",
            )}
          >
            <span className="text-3xl">🪙</span>
            <p className={cn("mt-1 text-sm font-bold", choice === "tails" ? "text-gold-300" : "text-muted-foreground")}>Tails</p>
          </button>
        </div>
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={flipping || engine.busy}>
          {flipping ? "Flipping..." : engine.busy ? "Processing..." : "Flip Coin"}
        </Button>
      </div>
    </GameLayout>
  );
}
