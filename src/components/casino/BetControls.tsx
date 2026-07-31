import { cn } from "@/lib/utils";

interface BetControlsProps {
  bet: number;
  setBet: (v: number) => void;
  min?: number;
  max?: number;
  balance?: number;
}

const quickAmounts = [100, 500, 1000, 5000];

export function BetControls({ bet, setBet, min = 10, max = 100000, balance = 0 }: BetControlsProps) {
  const pct = Math.min(((bet - min) / (max - min)) * 100, 100);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bet Amount
        </span>
        <span className="font-mono text-sm font-bold text-gold-300">₹{bet.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setBet(Math.max(min, bet / 2))}
          className="btn-ghost-gold flex-1 rounded-lg py-2 text-xs"
        >
          ½
        </button>
        <button
          onClick={() => setBet(Math.min(max, bet * 2))}
          className="btn-ghost-gold flex-1 rounded-lg py-2 text-xs"
        >
          2×
        </button>
        <button
          onClick={() => setBet(Math.min(balance, bet + 100))}
          className="btn-ghost-gold flex-1 rounded-lg py-2 text-xs"
        >
          +100
        </button>
        <button
          onClick={() => setBet(balance)}
          className="btn-ghost-gold flex-1 rounded-lg py-2 text-xs"
        >
          Max
        </button>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-600"
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={Math.min(bet, max)}
          onChange={(e) => setBet(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-300 [&::-webkit-slider-thumb]:bg-gold-500"
        />
      </div>
      <div className="flex gap-2">
        {quickAmounts.map((a) => (
          <button
            key={a}
            onClick={() => setBet(a)}
            className={cn(
              "flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors",
              bet === a
                ? "border-gold-500/60 bg-gold-500/20 text-gold-300"
                : "border-white/10 bg-white/5 text-muted-foreground",
            )}
          >
            {a >= 1000 ? `${a / 1000}K` : a}
          </button>
        ))}
      </div>
    </div>
  );
}
