import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="safe-bottom mx-auto max-w-[480px]"
      >
        <Outlet />
      </motion.main>
      <BottomNav />
    </div>
  );
}
