import { GameHeader } from "./GameHeader";
import type { ReactNode } from "react";
import type { GameSlug } from "@/types";

interface GameLayoutProps {
  slug: GameSlug;
  children: ReactNode;
}

export function GameLayout({ slug, children }: GameLayoutProps) {
  return (
    <div className="min-h-screen px-4 pb-8 pt-4">
      <GameHeader slug={slug} />
      {children}
    </div>
  );
}
