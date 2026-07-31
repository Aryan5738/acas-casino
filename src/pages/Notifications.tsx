import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Trophy, Gift, Info, Megaphone, Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useGames";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { FullScreenLoader, ErrorState } from "@/components/ui/feedback";
import { formatTimeAgo } from "@/lib/utils";

const typeMeta: Record<string, { icon: ComponentType<{ className?: string }>; color: string }> = {
  win: { icon: Trophy, color: "text-emerald-400" },
  bonus: { icon: Gift, color: "text-gold-400" },
  promo: { icon: Megaphone, color: "text-purple-400" },
  system: { icon: Info, color: "text-blue-400" },
  info: { icon: Coins, color: "text-muted-foreground" },
};

export default function Notifications() {
  const { user } = useAuth();
  const { data: notifications, isLoading, isError, refetch } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead(user?.id);
  const [livePulse, setLivePulse] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("notif-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          setLivePulse(true);
          refetch();
          setTimeout(() => setLivePulse(false), 2000);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [user, refetch]);

  return (
    <div>
      <Header title="Notifications" />
      <PageContainer>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {notifications?.filter((n) => !n.is_read).length ?? 0} unread
            {livePulse && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-gold-500" />}
          </p>
          <button
            onClick={() => markAll.mutate()}
            className="flex items-center gap-1.5 text-xs font-semibold text-gold-400"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        </div>

        {isLoading ? (
          <FullScreenLoader />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n) => {
                const meta = typeMeta[n.type] ?? typeMeta.info;
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => !n.is_read && markRead.mutate(n.id)}
                    className={`glass flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-all ${
                      n.is_read ? "opacity-55" : "border-gold-500/25"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">{n.title}</p>
                        {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                      </div>
                      {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-[10px] text-muted-foreground/70">{formatTimeAgo(n.created_at)}</p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-16 text-center">
            <span className="text-4xl">🔔</span>
            <p className="mt-3 text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
