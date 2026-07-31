export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string;
          criteria: Json;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
          points: number;
          slug: string;
        };
        Insert: {
          created_at?: string;
          criteria?: Json;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          points?: number;
          slug: string;
        };
        Update: {
          created_at?: string;
          criteria?: Json;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          points?: number;
          slug?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          created_at: string;
          id: string;
          permissions: Json;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          permissions?: Json;
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          permissions?: Json;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      game_history: {
        Row: {
          bet_amount: number;
          created_at: string;
          data: Json;
          game_id: string;
          game_slug: string;
          id: string;
          payout: number;
          result: string;
          user_id: string;
        };
        Insert: {
          bet_amount: number;
          created_at?: string;
          data?: Json;
          game_id: string;
          game_slug: string;
          id?: string;
          payout?: number;
          result: string;
          user_id: string;
        };
        Update: {
          bet_amount?: number;
          created_at?: string;
          data?: Json;
          game_id?: string;
          game_slug?: string;
          id?: string;
          payout?: number;
          result?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_history_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          gradient: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          max_bet: number;
          min_bet: number;
          name: string;
          rtp: number;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string | null;
          gradient?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          max_bet?: number;
          min_bet?: number;
          name: string;
          rtp?: number;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          gradient?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          max_bet?: number;
          min_bet?: number;
          name?: string;
          rtp?: number;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      leaderboard: {
        Row: {
          best_streak: number;
          games_played: number;
          id: string;
          period: string;
          rank_position: number | null;
          total_winnings: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          best_streak?: number;
          games_played?: number;
          id?: string;
          period?: string;
          rank_position?: number | null;
          total_winnings?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          best_streak?: number;
          games_played?: number;
          id?: string;
          period?: string;
          rank_position?: number | null;
          total_winnings?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          title: string;
          type?: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          games_played: number;
          id: string;
          is_banned: boolean;
          last_seen_at: string | null;
          referral_code: string | null;
          referred_by: string | null;
          total_deposits: number;
          total_wagered: number;
          total_withdrawals: number;
          updated_at: string;
          username: string | null;
          vip_level_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          games_played?: number;
          id: string;
          is_banned?: boolean;
          last_seen_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          total_deposits?: number;
          total_wagered?: number;
          total_withdrawals?: number;
          updated_at?: string;
          username?: string | null;
          vip_level_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          games_played?: number;
          id?: string;
          is_banned?: boolean;
          last_seen_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          total_deposits?: number;
          total_wagered?: number;
          total_withdrawals?: number;
          updated_at?: string;
          username?: string | null;
          vip_level_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey";
            columns: ["referred_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_vip_level_id_fkey";
            columns: ["vip_level_id"];
            isOneToOne: false;
            referencedRelation: "vip_levels";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          balance_after: number | null;
          created_at: string;
          id: string;
          metadata: Json;
          reference: string | null;
          status: string;
          type: string;
          user_id: string;
          wallet_id: string | null;
        };
        Insert: {
          amount: number;
          balance_after?: number | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          reference?: string | null;
          status?: string;
          type: string;
          user_id: string;
          wallet_id?: string | null;
        };
        Update: {
          amount?: number;
          balance_after?: number | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          reference?: string | null;
          status?: string;
          type?: string;
          user_id?: string;
          wallet_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      user_achievements: {
        Row: {
          achievement_id: string;
          unlocked_at: string;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          unlocked_at?: string;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          unlocked_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vip_levels: {
        Row: {
          bonus_pct: number;
          cashback_pct: number;
          created_at: string;
          icon: string | null;
          id: string;
          level: number;
          min_deposit: number;
          name: string;
          perks: string[];
          updated_at: string;
        };
        Insert: {
          bonus_pct?: number;
          cashback_pct?: number;
          created_at?: string;
          icon?: string | null;
          id?: string;
          level: number;
          min_deposit?: number;
          name: string;
          perks?: string[];
          updated_at?: string;
        };
        Update: {
          bonus_pct?: number;
          cashback_pct?: number;
          created_at?: string;
          icon?: string | null;
          id?: string;
          level?: number;
          min_deposit?: number;
          name?: string;
          perks?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          balance: number;
          bonus_balance: number;
          created_at: string;
          currency: string;
          id: string;
          is_frozen: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          bonus_balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          is_frozen?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          bonus_balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          is_frozen?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      make_admin: { Args: { p_role?: string; p_user_id: string }; Returns: undefined };
      place_bet: {
        Args: { p_amount: number; p_game_slug: string };
        Returns: string;
      };
      refresh_leaderboard: { Args: { p_period?: string }; Returns: undefined };
      settle_game: {
        Args: {
          p_bet_amount: number;
          p_data?: Json;
          p_game_slug: string;
          p_payout: number;
          p_result: string;
        };
        Returns: string;
      };
      wallet_transaction: {
        Args: {
          p_amount: number;
          p_balance_after: number;
          p_metadata?: Json;
          p_reference?: string;
          p_status?: string;
          p_type: string;
          p_user_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
