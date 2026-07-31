import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { CardFace, drawCard, type CardType } from "@/components/casino/Cards";
import { cn } from "@/lib/utils";

const VALUES: Record<string, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

export default function HiLo() {
  const engine = useGameEngine({ slug: "hilo" });
  const [bet, setBet] = useState(100);
  const [card, setCard] = useState<CardType>(() => drawCard());
  const [history, setHistory] = useState<CardType[]>([]);
  const [streak, setStreak] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);

  const start = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setCard(drawCard());
    setHistory([]);
    setStreak(0);
    setResult(null);
    setPayout(0);
    setPlaying(true);
  };

  const guess = async (direction: "higher" | "lower") => {
    if (!playing) return;
    const next = drawCard();
    const cur = VALUES[card.rank];
    const nxt = VALUES[next.rank];
    const won = direction === "higher" ? nxt >= cur : nxt <= cur;

    if (won) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setHistory((h) => [...h, card]);
      setCard(next);
      if (newStreak >= 7) {
        setPlaying(false);
        const winPayout = bet * 5;
        setResult("win");
        setPayout(winPayout);
        await engine.settle({ betAmount: bet, payout: winPayout, result: "win", data: { streak: newStreak, history: [...history, card] } });
      }
    } else {
      setPlaying(false);
      setResult("loss");
      await engine.settle({ betAmount: bet, payout: 0, result: "loss", data: { streak, card, next } });
    }
  };

  const currentMultiplier = Math.min(1 + streak * 0.4, 5);

  return (
    <GameLayout slug="hilo">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Card</p>
            <p className="mt-0.5 text-2xl font-extrabold text-gold-300">{streak}× Streak</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Payout</p>
            <p className="font-mono text-2xl font-extrabold text-emerald-400">{currentMultiplier.toFixed(2)}×</p>
          </div>
        </div>

        <div className="mt-4 flex h-44 items-center justify-center gap-3">
          <CardFace card={card} />
        </div>

        {history.length > 0 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {history.map((c, i) => (
              <div key={i} className="flex shrink-0 flex-col items-center">
                <CardFace card={c} small />
                <span className="mt-1 text-[9px] text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "mt-4 rounded-xl border px-4 py-2.5 text-center text-sm font-bold",
              result === "win" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-red-500/40 bg-red-500/10 text-red-400",
            )}
          >
            {result === "win" ? `You won ₹${payout.toFixed(2)}!` : `Lost at streak ${streak}`}
          </motion.p>
        )}
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        {playing ? (
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" onClick={() => guess("higher")} disabled={engine.busy}>
              Higher ▲
            </Button>
            <Button size="lg" variant="ghost" onClick={() => guess("lower")} disabled={engine.busy}>
              Lower ▼
            </Button>
          </div>
        ) : (
          <>
            <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
            <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
              {engine.busy ? "Processing..." : result ? "Play Again" : "Start Game"}
            </Button>
          </>
        )}
      </div>
    </GameLayout>
  );
}
