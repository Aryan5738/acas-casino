import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type GameHistory = Database["public"]["Tables"]["game_history"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type VipLevel = Database["public"]["Tables"]["vip_levels"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

export type GameSlug =
  | "mines"
  | "roulette"
  | "dice"
  | "coinflip"
  | "plinko"
  | "wheelspin"
  | "crash"
  | "hilo"
  | "keno"
  | "dragontower"
  | "blackjack"
  | "poker"
  | "baccarat"
  | "slots";

export interface BetResult {
  historyId: string;
  result: "win" | "loss";
  payout: number;
}
