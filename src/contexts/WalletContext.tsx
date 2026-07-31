import * as React from "react";
import { supabase } from "@/lib/supabase";
import type { Wallet } from "@/types";
import { useAuth } from "./AuthContext";

interface WalletContextValue {
  wallet: Wallet | null;
  refreshWallet: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

const WalletContext = React.createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = React.useState<Wallet | null>(null);

  const refreshWallet = React.useCallback(async () => {
    if (!user) {
      setWallet(null);
      return;
    }
    const { data } = await supabase.from("wallets").select("*").eq("user_id", user.id).single();
    if (data) setWallet(data);
  }, [user]);

  React.useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  React.useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("wallet-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wallets", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setWallet(payload.new as Wallet);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const deposit = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount,
      status: "completed",
      reference: `DEP-${Date.now()}`,
      metadata: { method: "manual" },
    });
    if (error) throw new Error(error.message);
    await refreshWallet();
  };

  const withdraw = async (amount: number) => {
    if (!user || !wallet) return;
    if (amount > wallet.balance) throw new Error("Insufficient balance");
    const balanceAfter = wallet.balance - amount;
    const { error } = await supabase.rpc("wallet_transaction", {
      p_user_id: user.id,
      p_type: "withdraw",
      p_amount: amount,
      p_balance_after: balanceAfter,
      p_status: "completed",
      p_reference: `WIT-${Date.now()}`,
      p_metadata: { method: "manual" },
    });
    if (error) throw new Error(error.message);
    await supabase.from("wallets").update({ balance: balanceAfter }).eq("user_id", user.id);
    await refreshWallet();
  };

  return (
    <WalletContext.Provider value={{ wallet, refreshWallet, deposit, withdraw }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = React.useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
