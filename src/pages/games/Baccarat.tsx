import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { CardFace, drawCard, handValue, type CardType } from "@/components/casino/Cards";
import { cn } from "@/lib/utils";

type BetChoice = "player" | "banker" | "tie";

const PAYOUTS: Record<BetChoice, number> = { player: 1.97, banker: 1.92, tie: 9 };

export default function Baccarat() {
  const engine = useGameEngine({ slug: "baccarat" });
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<BetChoice>("player");
  const [playerCards, setPlayerCards] = useState<CardType[]>([]);
  const [bankerCards, setBankerCards] = useState<CardType[]>([]);
  const [dealing, setDealing] = useState(false);
  const [result, setResult] = useState<{ winner: BetChoice | null; payout: number } | null>(null);

  const baccaratValue = (hand: CardType[]) => handValue(hand) % 10;

  const play = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setDealing(true);
    setResult(null);
    setPlayerCards([]);
    setBankerCards([]);

    const p: CardType[] = [drawCard(), drawCard()];
    const b: CardType[] = [drawCard(), drawCard()];
    setPlayerCards([p[0]]);
    setBankerCards([b[0]]);
    await new Promise((r) => setTimeout(r, 500));
    setPlayerCards([...p]);
    setBankerCards([...b]);
    await new Promise((r) => setTimeout(r, 600));

    const pv = baccaratValue(p);
    const bv = baccaratValue(b);
    if ((pv >= 8 || bv >= 8) === false) {
      if (pv <= 5) {
        p.push(drawCard());
        setPlayerCards([...p]);
        await new Promise((r) => setTimeout(r, 600));
      }
      const pv2 = baccaratValue(p);
      if (bv <= 5 && !(p.length === 3 && (pv2 === 0 || pv2 === 1 || (pv2 === 2 && (b[0]?.rank === "K" || b[1]?.rank === "K"))))) {
        b.push(drawCard());
        setBankerCards([...b]);
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    const finalPv = baccaratValue(p);
    const finalBv = baccaratValue(b);
    const winner: BetChoice = finalPv > finalBv ? "player" : finalBv > finalPv ? "banker" : "tie";
    const won = winner === choice;
    const payout = won ? bet * PAYOUTS[choice] : 0;
    setResult({ winner, payout });
    setDealing(false);
    await engine.settle({ betAmount: bet, payout, result: won ? "win" : "loss", data: { winner, player: finalPv, banker: finalBv, bet: choice } });
  };

  const choices: { key: BetChoice; label: string; sub: string }[] = [
    { key: "player", label: "PLAYER", sub: "1.97×" },
    { key: "tie", label: "TIE", sub: "9×" },
    { key: "banker", label: "BANKER", sub: "1.92×" },
  ];

  return (
    <GameLayout slug="baccarat">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Banker</p>
          <p className="font-mono text-sm font-bold text-red-400">
            {bankerCards.length ? baccaratValue(bankerCards) : "—"}
          </p>
        </div>
        <div className="mt-2 flex min-h-36 items-center gap-2">
          {bankerCards.map((c, i) => (
            <CardFace key={`b-${i}`} card={c} small />
          ))}
        </div>

        <div className="my-4 h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Player</p>
          <p className="font-mono text-sm font-bold text-blue-400">
            {playerCards.length ? baccaratValue(playerCards) : "—"}
          </p>
        </div>
        <div className="mt-2 flex min-h-36 items-center gap-2">
          {playerCards.map((c, i) => (
            <CardFace key={`p-${i}`} card={c} small />
          ))}
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "mt-4 rounded-xl border px-4 py-2.5 text-center text-sm font-bold uppercase",
              result.payout > 0
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-white/15 bg-white/5 text-muted-foreground",
            )}
          >
            {result.winner} wins {result.payout > 0 ? `· +₹${result.payout.toFixed(2)}` : "· you lost"}
          </motion.p>
        )}
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {choices.map((c) => (
            <button
              key={c.key}
              onClick={() => setChoice(c.key)}
              className={cn(
                "rounded-xl border py-3.5 text-center transition-all",
                choice === c.key
                  ? c.key === "tie"
                    ? "border-emerald-500/60 bg-emerald-500/20 shadow-glow"
                    : "border-gold-500/60 bg-gold-500/20 shadow-glow"
                  : "border-white/10 bg-white/5",
              )}
            >
              <p className={cn("text-sm font-extrabold", choice === c.key ? "text-gold-300" : "text-muted-foreground")}>{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.sub}</p>
            </button>
          ))}
        </div>
        <BetControls bet={bet} setBet={setBet} max={Math.min(200000, engine.balance)} balance={engine.balance} />
        <Button className="mt-4 w-full" size="lg" onClick={play} disabled={dealing || engine.busy}>
          {dealing ? "Dealing..." : engine.busy ? "Processing..." : "Deal Cards"}
        </Button>
      </div>
    </GameLayout>
  );
}
