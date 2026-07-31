import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin", className)} />;
}

export function FullScreenLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-sm text-muted-foreground">{message ?? "Something went wrong"}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost-gold rounded-lg px-4 py-2 text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}
