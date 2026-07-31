import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { label: "1×", color: "#3b3b46" },
  { label: "2×", color: "#1f6feb" },
  { label: "3×", color: "#2da44e" },
  { label: "5×", color: "#bf8700" },
  { label: "10×", color: "#d1242f" },
  { label: "25×", color: "#8250df" },
  { label: "50×", color: "#d03592" },
  { label: "100×", color: "#d4af37" },
];

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
    await new Promise((r) => setTimeout(r, 2400));
    const index = Math.floor(Math.random() * SEGMENTS.length);
    const multiplier = Number(SEGMENTS[index].label.replace("×", ""));
    const payout = bet * multiplier;
    setRotation((r) => r + 360 * 6 + index * (360 / SEGMENTS.length));
    setResult({ index, multiplier, payout });
    await engine.settle({ betAmount: bet, payout, result: payout > bet ? "win" : "loss", data: { segment: SEGMENTS[index].label } });
    setSpinning(false);
  };

  return (
    <GameLayout slug="wheelspin">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="flex flex-col items-center">
        <div className="relative h-72 w-72">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: [0.15, 0.85, 0.2, 1] }}
            className="relative h-72 w-72 rounded-full border-8 border-gold-500/30 shadow-glow-lg"
            style={{
              background: `conic-gradient(${SEGMENTS.map((s, i) => `${s.color} ${(i * 360) / SEGMENTS.length}deg ${((i + 1) * 360) / SEGMENTS.length}deg`).join(",")})`,
            }}
          >
            {SEGMENTS.map((s, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotate(${(360 / SEGMENTS.length) * i}deg) translateY(-118px)` }}
              >
                <span className="block text-sm font-extrabold text-white drop-shadow">{s.label}</span>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-gold-500/40 bg-black">
              <span className="text-2xl">🎰</span>
            </div>
          </motion.div>
          <div className="absolute right-2 top-1/2 h-8 w-4 -translate-y-1/2 rounded-l bg-gold-400 shadow-glow" />
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("mt-4 text-lg font-extrabold", result.multiplier > 1 ? "text-emerald-400" : "text-red-400")}
          >
            {result.multiplier > 1 ? `🎉 ${result.multiplier}× → +₹${result.payout.toFixed(2)}` : "Landed on 1× — better luck next spin"}
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
