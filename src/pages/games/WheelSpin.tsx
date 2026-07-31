import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { WheelIcon } from "@/components/casino/gameIcons";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { label: "1x", color: "#3b3b46" },
  { label: "2x", color: "#1f6feb" },
  { label: "3x", color: "#2da44e" },
  { label: "5x", color: "#bf8700" },
  { label: "10x", color: "#d1242f" },
  { label: "25x", color: "#8250df" },
  { label: "50x", color: "#d03592" },
  { label: "100x", color: "#d4af37" },
];
const SEG = 360 / SEGMENTS.length;
const CX = 110;
const CY = 110;
const R = 88;

function wedge(a0: number, a1: number, r = R) {
  const p = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(CX + r * Math.cos(rad)).toFixed(2)},${(CY + r * Math.sin(rad)).toFixed(2)}`;
  };
  return `M ${CX},${CY} L ${p(a0)} A ${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)} Z`;
}

function landingRotation(current: number, index: number, spins: number) {
  const target = (360 - (index * SEG + SEG / 2)) % 360;
  const delta = (target - (current % 360) + 360) % 360;
  return current + spins * 360 + delta;
}

export default function WheelSpin() {
  const engine = useGameEngine({ slug: "wheelspin" });
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ index: number; multiplier: number; payout: number } | null>(null);
  const [rotation, setRotation] = useState(0);

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setSpinning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 700));
    const index = Math.floor(Math.random() * SEGMENTS.length);
    const multiplier = Number(SEGMENTS[index].label.replace("x", ""));
    const payout = bet * multiplier;
    setRotation((cur) => landingRotation(cur, index, 6));
    await new Promise((r) => setTimeout(r, 4700));
    setResult({ index, multiplier, payout });
    await engine.settle({ betAmount: bet, payout, result: payout > bet ? "win" : "loss", data: { segment: SEGMENTS[index].label } });
    setSpinning(false);
  };

  return (
    <GameLayout slug="wheelspin">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="flex flex-col items-center">
        <div className="relative h-72 w-72">
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
            <svg width="14" height="22" viewBox="0 0 14 22">
              <path d="M7 22 0 4h14z" fill="#d4af37" stroke="#7d5a12" strokeWidth="1.5" />
            </svg>
          </div>
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: [0.12, 0.6, 0.08, 1] }}
            className="absolute inset-0"
          >
            <svg width="220" height="220" viewBox="0 0 220 220" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl">
              <defs>
                <radialGradient id="whub" cx="0.4" cy="0.35" r="1">
                  <stop offset="0" stopColor="#f5df8d" />
                  <stop offset="1" stopColor="#b8860b" />
                </radialGradient>
              </defs>
              <circle cx={CX} cy={CY} r={R + 12} fill="#0a0a0f" stroke="#d4af37" strokeWidth="3" />
              <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="#7d5a12" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
              {SEGMENTS.map((s, i) => (
                <g key={i}>
                  <path
                    d={wedge(i * SEG, (i + 1) * SEG, R + 9)}
                    fill={s.color}
                    stroke="#0a0a0f"
                    strokeWidth="1.5"
                    opacity={result?.index === i ? 1 : 0.9}
                  />
                  {result?.index === i && (
                    <path d={wedge(i * SEG, (i + 1) * SEG, R + 9)} fill="none" stroke="#f5df8d" strokeWidth="3.5" className="drop-shadow-[0_0_6px_#d4af37]" />
                  )}
                </g>
              ))}
              {SEGMENTS.map((s, i) => {
                const rad = ((i * SEG + SEG / 2 - 90) * Math.PI) / 180;
                return (
                  <text
                    key={`t${i}`}
                    x={CX + (R - 14) * Math.cos(rad)}
                    y={CY + (R - 14) * Math.sin(rad) + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    {s.label}
                  </text>
                );
              })}
              <circle cx={CX} cy={CY} r={26} fill="#0a0a0f" stroke="#d4af37" strokeWidth="2" />
              <circle cx={CX} cy={CY} r={10} fill="url(#whub)" />
            </svg>
          </motion.div>
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 flex items-center gap-2 text-lg font-extrabold",
              result.multiplier > 1 ? "text-emerald-400" : "text-muted-foreground",
            )}
          >
            <WheelIcon size={22} />
            {result.multiplier > 1 ? `${result.multiplier}x → +₹${result.payout.toFixed(2)}` : "Landed on 1x — better luck next spin"}
          </motion.p>
        )}
      </div>

      <div className="mt-5 rounded-2xl glass p-4">
        <BetControls bet={bet} setBet={setBet} max={Math.min(100000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={spinning || engine.busy}>
          {spinning ? "Spinning..." : engine.busy ? "Processing..." : "Spin the Wheel"}
        </Button>
      </div>
    </GameLayout>
  );
}
