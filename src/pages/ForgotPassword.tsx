import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { KeyRound, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/feedback";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      await resetPassword(values.email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reset email");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-premium-dark px-6 pt-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold tracking-tight">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll email you a secure link to reset your password
        </p>
      </motion.div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 flex flex-col items-center text-center"
        >
          <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl">
            <MailCheck className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="mt-4 text-lg font-bold">Check your inbox</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
          <Link to="/login" className="btn-gold mt-6 rounded-lg px-6 py-2.5 text-sm">
            Back to Login
          </Link>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : <KeyRound className="h-4 w-4" />}
            Send Reset Link
          </Button>
        </motion.form>
      )}
    </div>
  );
}
