import * as React from "react";
import { supabase } from "@/lib/supabase";
import { usePlaceBet, useSettleGame } from "@/hooks/useGames";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { GameSlug } from "@/types";

interface GameEngineOptions {
  slug: GameSlug;
  autoShowError?: boolean;
}

/**
 * Central game engine: handles auth gate, bet placement, settlement,
 * optimistic balance updates and error toasts.
 */
export function useGameEngine({ slug, autoShowError = true }: GameEngineOptions) {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const navigate = useNavigate();
  const placeBet = usePlaceBet();
  const settleGame = useSettleGame();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (error && autoShowError) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error, autoShowError]);

  const requireAuth = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const place = async (amount: number) => {
    if (!requireAuth()) return null;
    setError(null);
    setBusy(true);
    try {
      const txId = await placeBet.mutateAsync({ slug, amount });
      await refreshWallet();
      return txId;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bet failed";
      setError(msg);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const settle = async (opts: {
    betAmount: number;
    payout: number;
    result: "win" | "loss";
    data?: Record<string, unknown>;
  }) => {
    setBusy(true);
    try {
      const historyId = await settleGame.mutateAsync({ slug, ...opts });
      await refreshWallet();
      return historyId;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Settlement failed";
      setError(msg);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const checkWallet = (amount: number) => {
    if (!user) {
      navigate("/login");
      return false;
    }
    if (!wallet) return false;
    if (wallet.is_frozen) {
      setError("Wallet is frozen. Contact support.");
      return false;
    }
    if (wallet.balance < amount) {
      setError("Insufficient balance");
      return false;
    }
    return true;
  };

  return { user, wallet, balance: wallet?.balance ?? 0, busy, error, place, settle, checkWallet, refreshWallet };
}

export { supabase };
