import { NavLink, useNavigate } from "react-router-dom";
import { Home, Gamepad2, Coins, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/wallet", label: "Wallet", icon: Coins },
  { to: "/leaderboard", label: "Top", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-white/10 bg-black/70 backdrop-blur-2xl">
      <div className="grid grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-gold-400" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]")} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
      <button
        onClick={() => navigate("/games")}
        aria-label="Quick play"
        className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full p-1 shadow-glow"
        style={{ background: "linear-gradient(135deg,#f5df8d,#d4af37,#b8860b)" }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30">
          <Gamepad2 className="h-5 w-5 text-black" />
        </div>
      </button>
    </nav>
  );
}
