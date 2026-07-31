import { useState } from "react";
import { motion } from "framer-motion";
import { GameLayout } from "@/components/casino/GameLayout";
import { BetControls } from "@/components/casino/BetControls";
import { GameErrorToast } from "@/components/casino/GameErrorToast";
import { useGameEngine } from "@/hooks/useGameEngine";
import { Button } from "@/components/ui/button";
import { CardFace, CardBack, drawCard, handValue, type CardType } from "@/components/casino/Cards";
import { cn } from "@/lib/utils";

export default function Blackjack() {
  const engine = useGameEngine({ slug: "blackjack" });
  const [bet, setBet] = useState(100);
  const [player, setPlayer] = useState<CardType[]>([]);
  const [dealer, setDealer] = useState<CardType[]>([]);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [result, setResult] = useState<"win" | "loss" | "push" | null>(null);
  const [payout, setPayout] = useState(0);

  const start = async () => {
    const txId = await engine.place(bet);
    if (!txId) return;
    const p = [drawCard(), drawCard()];
    const d = [drawCard(), drawCard()];
    setPlayer(p);
    setDealer(d);
    setResult(null);
    setPayout(0);
    setPhase("playing");
    if (handValue(p) === 21) {
      finish(p, d, true);
    }
  };

  const finish = async (p: CardType[], d: CardType[], forcedWin?: boolean) => {
    setPhase("done");
    let dv = handValue(d);
    let dd = [...d];
    while (dv < 17) {
      dd = [...dd, drawCard()];
      dv = handValue(dd);
      await new Promise((r) => setTimeout(r, 500));
    }
    setDealer(dd);
    const pv = handValue(p);
    let outcome: "win" | "loss" | "push";
    if (forcedWin || pv === 21) outcome = "win";
    else if (dv > 21) outcome = pv <= 21 ? "win" : "loss";
    else if (pv > dv) outcome = "win";
    else if (pv < dv) outcome = "loss";
    else outcome = "push";
    setResult(outcome);
    const winPayout = outcome === "win" ? bet * 2 : outcome === "push" ? bet : 0;
    setPayout(winPayout);
    if (outcome === "push") {
      await engine.settle({ betAmount: bet, payout: bet, result: "win", data: { outcome: "push", player: pv, dealer: dv } });
    } else {
      await engine.settle({ betAmount: bet, payout: winPayout, result: outcome === "win" ? "win" : "loss", data: { outcome, player: pv, dealer: dv } });
    }
  };

  const hit = async () => {
    if (phase !== "playing") return;
    const np = [...player, drawCard()];
    setPlayer(np);
    if (handValue(np) > 21) {
      await finish(np, dealer);
    }
  };

  const stand = async () => {
    if (phase !== "playing") return;
    await finish(player, dealer);
  };

  const double = async () => {
    if (phase !== "playing" || player.length !== 2) return;
    setBet((b) => b * 2);
    const np = [...player, drawCard()];
    setPlayer(np);
    if (handValue(np) > 21) await finish(np, dealer);
    else await finish(np, dealer);
  };

  return (
    <GameLayout slug="blackjack">
      <GameErrorToast error={engine.error} onClose={() => {}} />

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dealer</p>
          <p className="font-mono text-sm font-bold">{dealer.length ? handValue(dealer) : "—"}</p>
        </div>
        <div className="mt-2 flex min-h-36 items-center gap-2">
          {dealer.length === 0 && (
            <div className="flex items-center justify-center gap-2">
              <CardBack />
            </div>
          )}
          {dealer.map((c, i) => (
            <CardFace key={`d-${i}`} card={c} small={dealer.length > 4} hidden={i === 1 && phase === "playing"} />
          ))}
        </div>

        <div className="my-4 h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">You</p>
          <p className={cn("font-mono text-sm font-bold", handValue(player) > 21 ? "text-red-400" : "text-gold-300")}>
            {player.length ? handValue(player) : "—"}
          </p>
        </div>
        <div className="mt-2 flex min-h-36 flex-wrap items-center gap-2">
          {player.length === 0 && (
            <div className="flex h-36 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <CardBack size={76} />
            </div>
          )}
          {player.map((c, i) => (
            <CardFace key={`p-${i}`} card={c} small={player.length > 4} />
          ))}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "mt-4 rounded-xl border px-4 py-2.5 text-center text-sm font-bold",
              result === "win" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
              result === "loss" && "border-red-500/40 bg-red-500/10 text-red-400",
              result === "push" && "border-white/20 bg-white/5 text-foreground",
            )}
          >
            {result === "win" ? `Blackjack! +₹${payout.toFixed(2)}` : result === "loss" ? "Dealer wins" : "Push — bet returned"}
          </motion.div>
        )}
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        {phase === "idle" ? (
          <>
            <BetControls bet={bet} setBet={setBet} max={Math.min(100000, engine.balance)} balance={engine.balance} />
            <Button className="mt-4 w-full" size="lg" onClick={start} disabled={engine.busy}>
              {engine.busy ? "Processing..." : "Deal Cards"}
            </Button>
          </>
        ) : phase === "playing" ? (
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={hit} disabled={engine.busy}>Hit</Button>
            <Button variant="ghost" onClick={stand} disabled={engine.busy}>Stand</Button>
            <Button variant="ghost" onClick={double} disabled={engine.busy || player.length !== 2}>
              Double
            </Button>
          </div>
        ) : (
          <Button className="w-full" size="lg" onClick={start} disabled={engine.busy}>
            Play Again
          </Button>
        )}
      </div>
    </GameLayout>
  );
}
