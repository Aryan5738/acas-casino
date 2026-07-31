import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GRID_SIZE = 5;

export default function Mines() {
  const engine = useGameEngine({ slug: "mines" });
  const [minesCount, setMinesCount] = useState(3);
  const [bet, setBet] = useState(100);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);
  const [started, setStarted] = useState(false);

  const multiplier = useMemo(() => {
    if (minesCount === 0) return 1;
    const safeCells = GRID_SIZE * GRID_SIZE - minesCount;
    const probability = Array.from({ length: revealed.length }, (_, i) =>
      (safeCells - i) / (GRID_SIZE * GRID_SIZE - i),
    ).reduce((a, b) => a * b, 1);
    if (probability === 0) return 1;
    const houseEdge = 0.97;
    return Math.min(Math.round((houseEdge / probability) * 100) / 100, 1000);
  }, [minesCount, revealed.length]);

  const startGame = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setRevealed([]);
    setGameOver(false);
    setResult(null);
    setPayout(0);
    setStarted(true);
  };

  const revealCell = async (index: number) => {
    if (!started || gameOver || revealed.includes(index)) return;
    const isMine = Math.random() < minesCount / (GRID_SIZE * GRID_SIZE - revealed.length);
    if (isMine) {
      setRevealed((r) => [...r, index]);
      setGameOver(true);
      setResult("loss");
      await engine.settle({ betAmount: bet, payout: 0, result: "loss", data: { mines: minesCount, revealed: [...revealed, index] } });
      setStarted(false);
      return;
    }
    const newRevealed = [...revealed, index];
    setRevealed(newRevealed);
    if (newRevealed.length === GRID_SIZE * GRID_SIZE - minesCount) {
      const winPayout = bet * multiplier;
      setGameOver(true);
      setResult("win");
      setPayout(winPayout);
      await engine.settle({ betAmount: bet, payout: winPayout, result: "win", data: { mines: minesCount, revealed: newRevealed, multiplier } });
      setStarted(false);
    }
  };

  const cashOut = async () => {
    if (!started || gameOver) return;
    const winPayout = bet * multiplier;
    setGameOver(true);
    setResult("win");
    setPayout(winPayout);
    await engine.settle({ betAmount: bet, payout: winPayout, result: "win", data: { mines: minesCount, revealed, multiplier, cashed_out: true } });
    setStarted(false);
  };

  return (
    <GameLayout slug="mines">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Mines</p>
        <p className="text-xs font-bold text-gold-300">Multiplier: {started && !gameOver ? multiplier.toFixed(2) : "1.00"}×</p>
      </div>

      <div className="mx-auto grid max-w-[340px] grid-cols-5 gap-2">
        {Array.from({ length: 25 }).map((_, i) => {
          const isRevealed = revealed.includes(i);
          const isMine = isRevealed && result === "loss";
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => revealCell(i)}
              disabled={!started || gameOver || isRevealed}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border text-2xl transition-all duration-300",
                !started && "border-white/10 bg-white/5",
                started && !isRevealed && "border-gold-500/25 bg-gold-500/5 hover:bg-gold-500/15",
                isRevealed && !isMine && "border-emerald-500/40 bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
                isMine && "border-red-500/50 bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.4)]",
              )}
            >
              {isRevealed ? (isMine ? "💥" : "💎") : started ? "" : "🔒"}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "mb-3 rounded-xl border px-4 py-2.5 text-center text-sm font-bold",
              result === "win" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-red-500/40 bg-red-500/10 text-red-400",
            )}
          >
            {result === "win" ? `You won ₹${payout.toFixed(2)}! 🎉` : "Boom! You hit a mine 💥"}
          </motion.div>
        )}
        {!started && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mines</span>
              <span className="font-mono text-sm font-bold text-gold-300">{minesCount}</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={minesCount}
              onChange={(e) => setMinesCount(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
          </div>
        )}
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={started && !gameOver ? cashOut : startGame}
          disabled={engine.busy}
        >
          {engine.busy ? "Processing..." : started && !gameOver ? `Cash Out ₹${(bet * multiplier).toFixed(2)}` : "Place Bet"}
        </Button>
      </div>
    </GameLayout>
  );
}
