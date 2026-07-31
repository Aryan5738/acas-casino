import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { CardFace, drawCard, handValue, type CardType } from "@/components/casino/Cards";
import { CardBack } from "@/components/casino/gameIcons";
import { cn } from "@/lib/utils";

export default function Poker() {
  const engine = useGameEngine({ slug: "poker" });
  const [bet, setBet] = useState(100);
  const [player, setPlayer] = useState<CardType[]>([]);
  const [opponent, setOpponent] = useState<CardType[]>([]);
  const [opponentShown, setOpponentShown] = useState(false);
  const [phase, setPhase] = useState<"idle" | "drawing" | "done">("idle");
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [payout, setPayout] = useState(0);

  const start = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    setPlayer([]);
    setOpponent([]);
    setOpponentShown(false);
    setResult(null);
    setPayout(0);
    setPhase("drawing");

    const p: CardType[] = [];
    const o: CardType[] = [];
    for (let i = 0; i < 5; i++) {
      p.push(drawCard());
      o.push(drawCard());
      setPlayer([...p]);
      setOpponent([...o]);
      await new Promise((r) => setTimeout(r, 450));
    }
    setPhase("done");
    await new Promise((r) => setTimeout(r, 900));
    setOpponentShown(true);

    const pv = handValue(p) % 21;
    const ov = handValue(o) % 21;
    const pScore = pv === 0 ? 21 : pv;
    const oScore = ov === 0 ? 21 : ov;
    const win = pScore > oScore;
    const winPayout = win ? bet * 1.97 : 0;
    setResult(win ? "win" : "loss");
    setPayout(winPayout);
    await engine.settle({ betAmount: bet, payout: winPayout, result: win ? "win" : "loss", data: { player: pScore, opponent: oScore } });
  };

  return (
    <GameLayout slug="poker">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            House {opponentShown && opponent.length ? handValue(opponent) % 21 || 21 : "??"}
          </p>
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-bold text-red-400">AI Dealer</span>
        </div>
        <div className="mt-2 flex min-h-36 flex-wrap items-center gap-2">
          {opponent.length === 0 && <div className="flex h-36 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/5"><CardBack size={76} /></div>}
          {opponent.map((c, i) => (
            <CardFace key={`o-${i}`} card={c} hidden={!opponentShown && phase === "done"} small />
          ))}
        </div>

        <div className="my-4 h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">You</p>
          <p className="font-mono text-sm font-bold text-gold-300">{player.length ? (handValue(player) % 21) || 21 : "—"}</p>
        </div>
        <div className="mt-2 flex min-h-36 flex-wrap items-center gap-2">
          {player.length === 0 && <div className="flex h-36 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/5"><CardBack size={76} /></div>}
          {player.map((c, i) => (
            <CardFace key={`p-${i}`} card={c} small />
          ))}
        </div>

        {result && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "mt-4 rounded-xl border px-4 py-2.5 text-center text-sm font-bold",
              result === "win" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-red-500/40 bg-red-500/10 text-red-400",
            )}
          >
            {result === "win" ? `You win the pot! +₹${payout.toFixed(2)}` : "House wins this round"}
          </motion.p>
        )}
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        {phase === "idle" ? (
          <>
            <BetControls bet={bet} setBet={setBet} max={Math.min(100000, engine.balance)} balance={engine.balance} />
            <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
              {engine.busy ? "Processing..." : "Deal Hand"}
            </Button>
          </>
        ) : (
          <Button className="w-full" size="lg" onClick={start} disabled={engine.busy}>
            Deal Again
          </Button>
        )}
      </div>
    </GameLayout>
  );
}
