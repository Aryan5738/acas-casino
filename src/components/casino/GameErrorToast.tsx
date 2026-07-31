import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export function GameErrorToast({ error, onClose }: { error: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed left-1/2 top-16 z-50 w-[90%] max-w-sm -translate-x-1/2"
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 shadow-xl backdrop-blur-xl">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="flex-1 text-xs font-medium text-red-200">{error}</p>
            <button onClick={onClose} className="text-red-300">✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
