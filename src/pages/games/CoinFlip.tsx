import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/casino/gameIcons";
import { cn } from "@/lib/utils";

function Coin({ side, spinning, win }: { side: "heads" | "tails" | null; spinning: boolean; win: boolean | null }) {
  return (
    <svg width="170" height="170" viewBox="0 0 48 48" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="coinface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5df8d" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
        <radialGradient id="coinshine" cx="0.3" cy="0.25" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="url(#coinface)" stroke="#7d5a12" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke="#7d5a12" strokeWidth="1" strokeDasharray="2.5 3" opacity="0.7" />
      <circle cx="24" cy="24" r="21" fill="url(#coinshine)" />
      <g opacity={spinning ? 0.5 : 1}>
        <circle
          cx="24"
          cy="24"
          r="11"
          fill="none"
          stroke={side === "tails" ? "#7d5a12" : win === true ? "#059669" : win === false ? "#b91c1c" : "#7d5a12"}
          strokeWidth={win != null ? 2 : 1.4}
        />
        {side === "tails" ? (
          <text x="24" y="29" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="800" fill="#5c4209">
            TAILS
          </text>
        ) : (
          <text x="24" y="29" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="#5c4209">
            A
          </text>
        )}
      </g>
      {spinning && (
        <g>
          <circle cx="24" cy="24" r="20" fill="none" stroke="#f5df8d" strokeWidth="0.6" strokeDasharray="2 6" className="animate-spin" style={{ transformOrigin: "center" }} />
        </g>
      )}
    </svg>
  );
}

export default function CoinFlip() {
  const engine = useGameEngine({ slug: "coinflip" });
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [flipping, setFlipping] = useState(false);
  const [side, setSide] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<{ win: boolean; payout: number } | null>(null);

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setFlipping(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    const landed: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const win = landed === choice;
    const payout = win ? bet * 1.97 : 0;
    setSide(landed);
    setResult({ win, payout });
    await engine.settle({ betAmount: bet, payout, result: win ? "win" : "loss", data: { side: landed, choice } });
    setFlipping(false);
  };

  return (
    <GameLayout slug="coinflip">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="flex flex-col items-center py-6">
        <motion.div
          key={side ?? (flipping ? "spin" : "idle")}
          initial={flipping ? { rotateY: 0 } : false}
          animate={
            flipping
              ? { rotateY: [0, 540, 1080, 1620, 2160], scale: [1, 0.92, 1.08, 0.96, 1] }
              : { rotateY: side === "tails" ? 180 : 0, scale: 1 }
          }
          transition={{ duration: 1.8, ease: [0.3, 0.8, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Coin side={side} spinning={flipping} win={result?.win ?? null} />
        </motion.div>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-6 flex items-center gap-2 rounded-full border px-4 py-1.5 text-base font-extrabold uppercase tracking-wider",
              result.win ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/15 bg-white/5 text-muted-foreground",
            )}
          >
            {side === "heads" ? "Heads" : "Tails"} — {result.win ? `+₹${result.payout.toFixed(2)}` : "Lost"}
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
            <div className="mx-auto w-12"><CoinIcon size={44} /></div>
            <p className={cn("mt-1 text-sm font-bold", choice === "heads" ? "text-gold-300" : "text-muted-foreground")}>Heads</p>
          </button>
          <button
            onClick={() => setChoice("tails")}
            className={cn(
              "rounded-xl border py-4 text-center transition-all",
              choice === "tails" ? "border-gold-500/60 bg-gold-500/20 shadow-glow" : "border-white/10 bg-white/5",
            )}
          >
            <div className="mx-auto w-12 opacity-90"><CoinIcon size={44} /></div>
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
