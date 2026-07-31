import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard } from "@/hooks/useGames";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FullScreenLoader, ErrorState } from "@/components/ui/feedback";
import { formatCompact, getInitials, cn } from "@/lib/utils";

const periods = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all", label: "All Time" },
];

const rankStyles = [
  { bg: "from-yellow-300 to-amber-600", label: "Champion" },
  { bg: "from-slate-200 to-slate-400", label: "Runner Up" },
  { bg: "from-orange-300 to-amber-700", label: "Third Place" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("all");
  const { data: entries, isLoading, isError, refetch } = useLeaderboard(period);

  const podium = (entries ?? []).slice(0, 3);
  const rest = (entries ?? []).slice(3);

  return (
    <div>
      <Header title="Leaderboard" />
      <PageContainer>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="grid w-full grid-cols-4">
            {periods.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <FullScreenLoader />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <>
            {podium.length > 0 && (
              <div className="mt-6 flex items-end justify-center gap-3">
                {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry, idx) => {
                  const rank = entry === podium[0] ? 0 : entry === podium[1] ? 1 : 2;
                  const heights = ["h-28", "h-20", "h-16"];
                  return (
                    <div key={entry.user_id} className="flex w-24 flex-col items-center">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-black",
                          rankStyles[rank].bg,
                          entry.user_id === user?.id && "ring-2 ring-gold-400",
                        )}
                      >
                        {getInitials((entry.profiles as unknown as { username?: string } | null)?.username)}
                      </div>
                      <p className="mt-1.5 w-full truncate text-center text-[10px] font-semibold">
                        {(entry.profiles as unknown as { username?: string } | null)?.username ?? "Player"}
                      </p>
                      <p className="text-[10px] text-gold-400">₹{formatCompact(entry.total_winnings)}</p>
                      <div
                        className={cn(
                          "mt-2 flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-2",
                          rankStyles[rank].bg,
                          heights[idx],
                        )}
                      >
                        <div className="flex flex-col items-center">
                          {rank === 0 ? (
                            <Crown className="h-5 w-5 text-black" />
                          ) : rank === 1 ? (
                            <Medal className="h-5 w-5 text-black" />
                          ) : (
                            <Trophy className="h-5 w-5 text-black" />
                          )}
                          <span className="text-lg font-extrabold text-black">#{rank + 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 space-y-2">
              {rest.map((entry, i) => {
                const profiles = entry.profiles as unknown as { username?: string; avatar_url?: string | null } | null;
                const isMe = entry.user_id === user?.id;
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "glass flex items-center gap-3 rounded-xl px-4 py-3",
                      isMe && "border-gold-500/50",
                    )}
                  >
                    <span className="w-6 text-center text-sm font-bold text-muted-foreground">#{i + 4}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                      {getInitials(profiles?.username)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">
                        {profiles?.username ?? "Player"} {isMe && <span className="text-gold-400">(You)</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{entry.games_played} games played</p>
                    </div>
                    <span className="text-sm font-bold text-gold-300">₹{formatCompact(entry.total_winnings)}</span>
                  </div>
                );
              })}

              {entries?.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                  <Trophy className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No rankings yet. Be the first to play!</p>
                </motion.div>
              )}
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
