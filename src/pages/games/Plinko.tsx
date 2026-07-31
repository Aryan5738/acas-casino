import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";

const ROWS = 12;
const MULTIPLIERS = [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6];

export default function Plinko() {
  const engine = useGameEngine({ slug: "plinko" });
  const [bet, setBet] = useState(100);
  const [dropping, setDropping] = useState(false);
  const [result, setResult] = useState<{ slot: number; multiplier: number; payout: number } | null>(null);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);

  const drop = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setDropping(true);
    setResult(null);
    let pos = 0;
    const path: number[] = [];
    for (let row = 0; row < ROWS - 1; row++) {
      pos += Math.random() < 0.5 ? -1 : 1;
      path.push(pos);
    }
    const slot = pos;
    const multiplier = MULTIPLIERS[Math.abs(slot)];
    const payout = bet * multiplier;
    for (let i = 0; i < path.length; i++) {
      setBallPos({ x: path[i] * 22, y: (i + 1) * 28 });
      await new Promise((r) => setTimeout(r, 130));
    }
    setResult({ slot, multiplier, payout });
    setBallPos(null);
    await engine.settle({ betAmount: bet, payout, result: payout >= bet ? "win" : "loss", data: { slot, multiplier } });
    setDropping(false);
  };

  const pegRows = Array.from({ length: ROWS });

  return (
    <GameLayout slug="plinko">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative h-[420px] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 to-purple-600/10" />
        <div className="relative h-full pt-6">
          {pegRows.map((_, r) => (
            <div key={r} className="flex justify-center gap-6 py-[7px]">
              {Array.from({ length: r + 1 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: r % 2 === 0 ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          ))}
          <motion.div
            animate={ballPos ? { x: ballPos.x, y: ballPos.y } : { x: 0, y: 0 }}
            transition={{ type: "tween", duration: 0.12 }}
            className="absolute left-1/2 top-6"
            style={{ marginLeft: -8 }}
          >
            {ballPos && (
              <span className="block h-4 w-4 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 shadow-glow" />
            )}
          </motion.div>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute left-1/2 top-[330px] -translate-x-1/2 rounded-full px-4 py-2 text-sm font-extrabold ${
                result.multiplier > 1 ? "bg-emerald-500 text-black" : "bg-white/10 text-muted-foreground"
              }`}
            >
              {result.multiplier > 1 ? `${result.multiplier}× +₹${result.payout.toFixed(2)}` : `${result.multiplier}× lost`}
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        <BetControls bet={bet} setBet={setBet} max={Math.min(50000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={drop} disabled={dropping || engine.busy}>
          {dropping ? "Dropping..." : engine.busy ? "Processing..." : "Drop Ball"}
        </Button>
      </div>
    </GameLayout>
  );
}
