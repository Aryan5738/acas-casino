import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGame } from "@/hooks/useGames";
import { Spinner } from "@/components/ui/feedback";
import { GameIcon } from "@/components/casino/gameIcons";
import type { GameSlug } from "@/types";

export function GameHeader({ slug }: { slug: GameSlug }) {
  const navigate = useNavigate();
  const { data: game, isLoading } = useGame(slug);

  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="glass flex h-9 w-9 items-center justify-center rounded-full"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-black/40">
          <GameIcon slug={slug} size={26} />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight">{game?.name ?? (isLoading ? "..." : slug)}</h1>
          <p className="text-[10px] uppercase tracking-widest text-gold-400/80">
            {game ? `RTP ${game.rtp}%` : "\u00A0"}
          </p>
        </div>
      </div>
      {isLoading && <Spinner className="ml-auto h-4 w-4 text-muted-foreground" />}
    </div>
  );
}
