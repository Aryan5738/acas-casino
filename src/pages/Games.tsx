import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useGames } from "@/hooks/useGames";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { FullScreenLoader, ErrorState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { GameIcon } from "@/components/casino/gameIcons";
import type { Game } from "@/types";

const categories = ["All", "instant", "table", "card", "lottery", "slot"];

export default function Games() {
  const navigate = useNavigate();
  const { data: games, isLoading, isError, refetch } = useGames();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = (games ?? []).filter((g) => {
    const matchCat = category === "All" || g.category === category;
    const matchQuery = g.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  if (isLoading) return <><Header /><FullScreenLoader /></>;
  if (isError) return <><Header /><ErrorState onRetry={() => refetch()} /></>;

  const GameTile = ({ game, index }: { game: Game; index: number }) => (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => navigate(`/games/${game.slug}`)}
      className="glass group relative flex aspect-[3/4] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl p-3 transition-transform active:scale-[0.95]"
    >
      <div className={`bg-gradient-to-br ${game.gradient ?? "from-gold-500 to-gold-700"} absolute inset-0 opacity-[0.07] transition-opacity group-hover:opacity-[0.15]`} />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/50 shadow-lg">
        <GameIcon slug={game.slug} size={34} />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold leading-tight">{game.name}</p>
        <p className="mt-0.5 text-[9px] uppercase tracking-wider text-gold-400/70">{game.rtp}% RTP</p>
      </div>
    </motion.button>
  );

  return (
    <div>
      <Header title="Games" showBalance={false} />
      <PageContainer className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                category === c
                  ? "bg-gold-500 text-black"
                  : "border border-white/10 bg-white/5 text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="opacity-60"><GameIcon slug="dice" size={40} /></span>
            <p className="text-sm text-muted-foreground">No games found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((g, i) => (
              <GameTile key={g.id} game={g} index={i} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
