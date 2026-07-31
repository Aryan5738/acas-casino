import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROWS = 12;
const MULTIPLIERS = [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6];
const PEG_COLORS = ["#d4af37", "#e2e8f0", "#d4af37", "#e2e8f0", "#d4af37"];

function PlinkoBall({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <defs>
        <radialGradient id="pball" cx="0.35" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor="#1e1b4b" />
        </radialGradient>
      </defs>
      <circle cx="11" cy="11" r="9" fill="url(#pball)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
    </svg>
  );
}

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
  const left = (r: number, i: number) => (r % 2 === 1 ? 14 : 0);

  return (
    <GameLayout slug="plinko">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass relative h-[420px] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/10 to-purple-600/10" />
        <div className="relative h-full pt-6">
          <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 300 400" preserveAspectRatio="xMidYMin meet">
            <defs>
              <linearGradient id="pegG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f5df8d" />
                <stop offset="1" stopColor="#b8860b" />
              </linearGradient>
            </defs>
            {pegRows.map((_, r) =>
              Array.from({ length: r + 1 }).map((_, i) => (
                <circle
                  key={`${r}-${i}`}
                  cx={150 - (r * 22) / 2 + i * 22 + left(r, i)}
                  cy={40 + r * 28}
                  r="3.5"
                  fill="url(#pegG)"
                  opacity={r % 3 === 0 ? 0.95 : 0.55}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="0.5"
                />
              )),
            )}
            {MULTIPLIERS.map((m, i) => (
              <g key={`m${i}`}>
                <rect
                  x={120 + (i - 4) * 16}
                  y={392}
                  width="16"
                  height={m > 1 ? 6 + Math.min(m * 4, 40) : 5}
                  fill={m > 1 ? "rgba(16,185,129,0.55)" : "rgba(248,113,113,0.45)"}
                  rx="2"
                />
                <text x={128 + (i - 4) * 16} y={m > 1 ? 384 - Math.min(m * 4, 40) : 384} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={m > 1 ? "#34d399" : "#f87171"}>
                  {m}×
                </text>
              </g>
            ))}
          </svg>

          <motion.div
            animate={ballPos ? { x: ballPos.x, y: ballPos.y } : { x: 0, y: 0 }}
            transition={{ type: "tween", duration: 0.12 }}
            className="absolute left-1/2 top-6 z-10"
            style={{ marginLeft: -11 }}
          >
            {ballPos && <PlinkoBall color={result?.multiplier && result.multiplier > 1 ? "#fbbf24" : "#f43f5e"} />}
          </motion.div>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "absolute left-1/2 top-[340px] z-10 -translate-x-1/2 rounded-full border px-4 py-2 text-sm font-extrabold",
                result.multiplier > 1 ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : "border-white/10 bg-white/5 text-muted-foreground",
              )}
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
