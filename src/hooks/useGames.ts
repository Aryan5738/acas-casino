import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Achievement, BetResult, Game, GameHistory, Notification, Transaction } from "@/types";

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Game[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGame(slug: string) {
  return useQuery({
    queryKey: ["games", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data as Game;
    },
  });
}

export function useGameHistory(userId?: string, limit = 20) {
  return useQuery({
    queryKey: ["game-history", userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("game_history")
        .select("*, games(name, icon)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as (GameHistory & { games: Pick<Game, "name" | "icon"> | null })[];
    },
    enabled: !!userId,
  });
}

export function useTransactions(userId?: string, limit = 30) {
  return useQuery({
    queryKey: ["transactions", userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!userId,
  });
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function usePlaceBet() {
  return useMutation({
    mutationFn: async ({ slug, amount }: { slug: string; amount: number }) => {
      const { data, error } = await supabase.rpc("place_bet", {
        p_game_slug: slug,
        p_amount: amount,
      });
      if (error) throw new Error(error.message);
      return data as string;
    },
  });
}

export function useSettleGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      betAmount,
      payout,
      result,
      data,
    }: {
      slug: string;
      betAmount: number;
      payout: number;
      result: "win" | "loss";
      data?: Record<string, unknown>;
    }) => {
      const { data: historyId, error } = await supabase.rpc("settle_game", {
        p_game_slug: slug,
        p_bet_amount: betAmount,
        p_payout: payout,
        p_result: result,
        p_data: data ?? {},
      });
      if (error) throw new Error(error.message);
      return historyId as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game-history"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useLeaderboard(period = "all", limit = 50) {
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      await supabase.rpc("refresh_leaderboard", { p_period: period });
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*, profiles(id, username, avatar_url)")
        .eq("period", period)
        .order("total_winnings", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useVipLevels() {
  return useQuery({
    queryKey: ["vip-levels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vip_levels").select("*").order("level");
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAchievements(userId?: string) {
  return useQuery({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      if (!userId) return { all: [], unlocked: new Set<string>() };
      const [allRes, unlockedRes] = await Promise.all([
        supabase.from("achievements").select("*"),
        supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
      ]);
      return {
        all: (allRes.data ?? []) as Achievement[],
        unlocked: new Set((unlockedRes.data ?? []).map((u) => u.achievement_id)),
      };
    },
    enabled: !!userId,
  });
}
