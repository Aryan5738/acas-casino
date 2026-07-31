import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { DragonIcon, MineIcon } from "@/components/casino/gameIcons";
import { cn, randomInt } from "@/lib/utils";

const ROWS = 8;
const COLUMNS = 5;

export default function DragonTower() {
  const engine = useGameEngine({ slug: "dragontower" });
  const [bet, setBet] = useState(100);
  const [level, setLevel] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);

  const start = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setLevel(0);
    setRevealed({});
    setResult(null);
    setPayout(0);
    setPlaying(true);
  };

  const pick = async (col: number) => {
    if (!playing || revealed[level] !== undefined) return;
    const safe = randomInt(0, COLUMNS - 1);
    const win = col === safe;
    setRevealed((r) => ({ ...r, [level]: col }));

    if (win) {
      const nextLevel = level + 1;
      if (nextLevel >= ROWS) {
        const winPayout = bet * 2.5;
        setPlaying(false);
        setResult("win");
        setPayout(winPayout);
        await engine.settle({ betAmount: bet, payout: winPayout, result: "win", data: { levels: ROWS, revealed: { ...revealed, [level]: col } } });
      } else {
        setLevel(nextLevel);
      }
    } else {
      setPlaying(false);
      setResult("loss");
      await engine.settle({ betAmount: bet, payout: 0, result: "loss", data: { level, safe, picked: col } });
    }
  };

  const multiplier = 1 + level * 0.2;

  return (
    <GameLayout slug="dragontower">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Level {level + 1} / {ROWS}</p>
          <p className="font-mono text-lg font-extrabold text-gold-300">{multiplier.toFixed(2)}× payout</p>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500" style={{ width: `${(level / ROWS) * 100}%` }} />
        </div>

        <div className="mt-5 space-y-2">
          {Array.from({ length: ROWS }).map((_, row) => {
            const activeRow = playing && row === level;
            return (
              <div key={row} className="flex justify-center gap-2">
                {Array.from({ length: COLUMNS }).map((_, col) => {
                  const wasPicked = revealed[row] === col;
                  const isSafe = wasPicked && row === level - 1;
                  const isBomb = wasPicked && row === level - 1 && result === "loss";
                  return (
                    <button
                      key={col}
                      onClick={() => pick(col)}
                      disabled={!activeRow || engine.busy}
                      className={cn(
                        "flex h-12 w-14 items-center justify-center rounded-lg border text-lg transition-all",
                        activeRow && "border-gold-500/30 bg-gold-500/5 hover:bg-gold-500/15 hover:shadow-glow",
                        isSafe && "border-emerald-500/50 bg-emerald-500/15",
                        isBomb && "border-red-500/50 bg-red-500/15",
                        !activeRow && !wasPicked && "border-white/5 bg-white/[0.03]",
                      )}
                    >
                      {wasPicked && (
                        isBomb ? (
                          <MineIcon size={26} />
                        ) : (
                          <DragonIcon size={26} />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "mt-4 rounded-xl border px-4 py-2.5 text-center text-sm font-bold",
              result === "win" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-red-500/40 bg-red-500/10 text-red-400",
            )}
          >
            {result === "win" ? `Tower complete! +₹${payout.toFixed(2)}` : `You fell at level ${level + 1}`}
          </motion.p>
        )}
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        {!playing && (
          <>
            <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
            <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
              {engine.busy ? "Processing..." : result ? "Play Again" : "Start Climb"}
            </Button>
          </>
        )}
      </div>
    </GameLayout>
  );
}
