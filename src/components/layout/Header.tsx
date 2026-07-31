import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ChevronLeft, Bell } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useNotifications } from "@/hooks/useGames";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showBalance?: boolean;
  right?: ReactNode;
}

export function Header({ title, showBack, showBalance = true, right }: HeaderProps) {
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { user } = useAuth();
  const { data: notifications } = useNotifications(user?.id);
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4">
        {showBack && (
          <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {title ? (
          <h1 className="text-base font-bold tracking-tight">{title}</h1>
        ) : (
          <div className="text-lg font-extrabold tracking-wide">
            <span className="text-gradient-gold">ACAS</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          {showBalance && (
            <button
              onClick={() => navigate("/wallet")}
              className="flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300"
            >
              <span className="text-[10px]">₹</span>
              {wallet ? formatCurrency(wallet.balance).replace("₹", "") : "0.00"}
            </button>
          )}
          <button
            onClick={() => navigate("/notifications")}
            className="relative text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-black">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {right}
        </div>
      </div>
    </header>
  );
}
