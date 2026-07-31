import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

export default function VerifyEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-premium-dark px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="glass flex h-20 w-20 items-center justify-center rounded-3xl animate-float">
          <MailCheck className="h-10 w-10 text-gold-400" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Verify Your Email</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          We've sent a verification link to{" "}
          <span className="font-semibold text-gold-300">{email}</span>. Click the link to activate your account.
        </p>
        <div className="mt-8 w-full space-y-3">
          <Link to="/login" className="btn-gold flex h-12 w-full items-center justify-center rounded-xl text-base">
            Go to Login
          </Link>
          <Link to="/" className="btn-ghost-gold flex h-12 w-full items-center justify-center rounded-xl text-base">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
