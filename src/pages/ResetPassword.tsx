import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/feedback";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw new Error(error.message);
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-premium-dark px-6 pt-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/40 bg-black/60">
          <ShieldCheck className="h-6 w-6 text-gold-400" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">New Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your account</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-4"
      >
        <div className="space-y-1.5">
          <Label>New Password</Label>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Confirm Password</Label>
          <Input type="password" placeholder="••••••••" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
        </div>
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Update Password
        </Button>
      </motion.form>
    </div>
  );
}
