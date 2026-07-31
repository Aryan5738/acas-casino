import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEG_COUNT = 37;
const SEG = 360 / SEG_COUNT;
const R = 90;
const CX = 110;
const CY = 110;
const LABEL_R = 66;

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const bets = [
  { key: "red", label: "Red", payout: 2, color: "#dc2626" },
  { key: "black", label: "Black", payout: 2, color: "#1f2937" },
  { key: "even", label: "Even", payout: 2, color: "#0ea5e9" },
  { key: "odd", label: "Odd", payout: 2, color: "#8b5cf6" },
  { key: "low", label: "1-18", payout: 2, color: "#10b981" },
  { key: "high", label: "19-36", payout: 2, color: "#f59e0b" },
] as const;

type BetKey = (typeof bets)[number]["key"];

function checkWin(num: number, bet: BetKey): boolean {
  if (num === 0) return false;
  switch (bet) {
    case "red": return REDS.has(num);
    case "black": return !REDS.has(num);
    case "even": return num % 2 === 0;
    case "odd": return num % 2 === 1;
    case "low": return num <= 18;
    case "high": return num > 18;
  }
}

function segmentColor(i: number) {
  if (i === 0) return "#16a34a";
  return REDS.has(i) ? "#dc2626" : "#18181b";
}

/** Wheel wedge path from angle a0 to a1 (degrees, clockwise from top) */
function wedge(a0: number, a1: number, r = R) {
  const p = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(CX + r * Math.cos(rad)).toFixed(2)},${(CY + r * Math.sin(rad)).toFixed(2)}`;
  };
  return `M ${CX},${CY} L ${p(a0)} A ${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)} Z`;
}

/** Rotation that lands number n under the top pointer, relative to a full rotation count */
function landingRotation(current: number, n: number, spins: number) {
  const target = (360 - (n * SEG + SEG / 2)) % 360;
  const delta = (target - (current % 360) + 360) % 360;
  return current + spins * 360 + delta;
}

export default function Roulette() {
  const engine = useGameEngine({ slug: "roulette" });
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<BetKey>("red");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ num: number; win: boolean; payout: number } | null>(null);
  const [rotation, setRotation] = useState(0);

  const selected = bets.find((b) => b.key === choice)!;

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setSpinning(true);
    setResult(null);
    const num = Math.floor(Math.random() * SEG_COUNT);
    await new Promise((r) => setTimeout(r, 900));
    setRotation((cur) => {
      const target = landingRotation(cur, num, 6 + Math.floor(Math.random() * 4));
      setTimeout(async () => {
        const win = checkWin(num, choice);
        const payout = win ? bet * selected.payout : 0;
        setResult({ num, win, payout });
        await engine.settle({ betAmount: bet, payout, result: win ? "win" : "loss", data: { number: num, bet: choice } });
        setSpinning(false);
      }, 4500);
      return target;
    });
  };

  return (
    <GameLayout slug="roulette">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="flex flex-col items-center">
        <div className="relative h-72 w-72">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/15 to-black shadow-[0_0_60px_rgba(16,185,129,0.2)]" />
          {/* Pointer */}
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
            <svg width="14" height="22" viewBox="0 0 14 22">
              <path d="M7 22 0 4h14z" fill="#d4af37" stroke="#7d5a12" strokeWidth="1.5" />
            </svg>
          </div>

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4.5, ease: [0.12, 0.6, 0.08, 1] }}
            className="relative h-72 w-72"
          >
            <svg width="220" height="220" viewBox="0 0 220 220" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl">
              <circle cx={CX} cy={CY} r={R + 14} fill="#0a0a0f" stroke="#d4af37" strokeWidth="3" />
              <circle cx={CX} cy={CY} r={R + 14} fill="none" stroke="#7d5a12" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
              {/* wedges */}
              {Array.from({ length: SEG_COUNT }).map((_, i) => {
                const isWinner = result?.num === i;
                return (
                  <g key={i}>
                    <path d={wedge(i * SEG, (i + 1) * SEG, R + 10)} fill={segmentColor(i)} stroke="#0a0a0f" strokeWidth="1" />
                    {isWinner && <path d={wedge(i * SEG, (i + 1) * SEG, R + 10)} fill="none" stroke="#f5df8d" strokeWidth="3.5" className="drop-shadow-[0_0_6px_#d4af37]" />}
                  </g>
                );
              })}
              {/* numbers */}
              {Array.from({ length: SEG_COUNT }).map((_, i) => {
                const rad = ((i * SEG + SEG / 2 - 90) * Math.PI) / 180;
                const x = CX + LABEL_R * Math.cos(rad);
                const y = CY + LABEL_R * Math.sin(rad);
                return (
                  <text
                    key={`t${i}`}
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight={700}
                    fill={i === 0 ? "#bbf7d0" : "#ffffff"}
                  >
                    {i}
                  </text>
                );
              })}
              <circle cx={CX} cy={CY} r={30} fill="#0a0a0f" stroke="#d4af37" strokeWidth="2" />
              <circle cx={CX} cy={CY} r="10" fill="url(#hub)" />
              <defs>
                <radialGradient id="hub" cx="0.4" cy="0.35" r="1">
                  <stop offset="0" stopColor="#f5df8d" />
                  <stop offset="1" stopColor="#b8860b" />
                </radialGradient>
              </defs>
              {/* ball */}
              <circle
                cx={CX}
                cy={CY - (R - 6)}
                r="5"
                fill="url(#ball)"
                className={spinning ? "animate-pulse" : ""}
              />
              <defs>
                <radialGradient id="ball" cx="0.35" cy="0.3" r="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.5" stopColor="#e5e7eb" />
                  <stop offset="1" stopColor="#9ca3af" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 flex items-center gap-2 rounded-full border px-4 py-1.5 text-base font-extrabold",
              result.win ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/15 bg-white/5 text-muted-foreground",
            )}
          >
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white", result.num === 0 ? "bg-green-600" : REDS.has(result.num) ? "bg-red-600" : "bg-zinc-800")}>
              {result.num}
            </span>
            {result.win ? `+₹${result.payout.toFixed(2)}` : "You lost this spin"}
          </motion.p>
        )}
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {bets.map((b) => (
            <button
              key={b.key}
              onClick={() => setChoice(b.key)}
              className={cn(
                "rounded-lg border py-2.5 text-center transition-all",
                choice === b.key ? "border-gold-500/60 bg-gold-500/20 shadow-glow" : "border-white/10 bg-white/5",
              )}
            >
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: b.color }} />
              <span className={cn("text-sm font-bold", choice === b.key ? "text-gold-300" : "text-muted-foreground")}>{b.label}</span>
              <p className="text-[9px] text-muted-foreground">{b.payout}x payout</p>
            </button>
          ))}
        </div>
        <BetControls bet={bet} setBet={setBet} max={Math.min(100000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={spinning || engine.busy}>
          {spinning ? "Spinning..." : engine.busy ? "Processing..." : `Bet ${selected.label}`}
        </Button>
      </div>
    </GameLayout>
  );
}
