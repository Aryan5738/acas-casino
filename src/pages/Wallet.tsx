import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, History, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useTransactions } from "@/hooks/useGames";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

export default function Wallet() {
  const { user, profile } = useAuth();
  const { wallet, deposit, withdraw } = useWallet();
  const { data: transactions } = useTransactions(user?.id, 50);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "withdraw" ? "withdraw" : "deposit");
  const [amount, setAmount] = useState("1000");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showUpi, setShowUpi] = useState(false);

  const copyReferral = async () => {
    if (!profile?.referral_code) return;
    await navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDeposit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setProcessing(true);
    setMessage(null);
    try {
      await deposit(amt);
      setMessage({ type: "success", text: `Deposit of ₹${amt} successful! +10% bonus credited.` });
      setShowUpi(true);
      setTimeout(() => setShowUpi(false), 4000);
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Deposit failed" });
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setProcessing(true);
    setMessage(null);
    try {
      await withdraw(amt);
      setMessage({ type: "success", text: `Withdrawal of ₹${amt} initiated successfully.` });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Withdrawal failed" });
    } finally {
      setProcessing(false);
    }
  };

  const txIcon = (type: string) => {
    switch (type) {
      case "deposit": return { icon: "📥", color: "text-emerald-400" };
      case "withdraw": return { icon: "📤", color: "text-red-400" };
      case "bet": return { icon: "🎲", color: "text-red-400" };
      case "win": return { icon: "🏆", color: "text-emerald-400" };
      case "bonus": return { icon: "🎁", color: "text-gold-400" };
      default: return { icon: "💳", color: "text-muted-foreground" };
    }
  };

  return (
    <div>
      <Header title="Wallet" showBalance={false} />
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-black/80 to-black/60 p-5 text-center shadow-glow"
        >
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-gold-500/10 blur-3xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-400/80">Total Balance</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight">
            <span className="text-gradient-gold">₹{wallet ? wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</span>
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">Bonus Balance: ₹{wallet?.bonus_balance.toFixed(2) ?? "0.00"}</p>
          {wallet?.is_frozen && (
            <p className="mt-2 rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold text-red-400">Wallet Frozen</p>
          )}
        </motion.div>

        <div className="mt-5 flex items-center justify-between rounded-xl glass px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Referral Code</p>
            <p className="font-mono text-sm font-bold text-gold-300">{profile?.referral_code ?? "REF--------"}</p>
          </div>
          <button onClick={copyReferral} className="btn-ghost-gold flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {message && (
          <div
            className={cn(
              "mt-4 rounded-lg border px-4 py-2.5 text-xs",
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400",
            )}
          >
            {message.text}
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab} className="mt-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit" className="flex items-center gap-1.5">
              <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-1.5">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <div className="glass rounded-xl p-5">
              <Label>Deposit Amount</Label>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold text-gold-400">₹</span>
                <Input
                  type="number"
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg font-bold"
                />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-bold transition-colors",
                      Number(amount) === a
                        ? "border-gold-500/60 bg-gold-500/20 text-gold-300"
                        : "border-white/10 bg-white/5 text-muted-foreground",
                    )}
                  >
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-gold-500/10 px-3 py-2 text-[11px] text-gold-300">
                🎁 +10% instant bonus on every deposit
              </div>
              <Button className="mt-4 w-full" size="lg" onClick={handleDeposit} disabled={processing}>
                {processing ? "Processing..." : `Deposit ₹${Number(amount) || 0}`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="glass rounded-xl p-5">
              <Label>Withdraw Amount</Label>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold text-gold-400">₹</span>
                <Input type="number" min={10} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg font-bold" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-bold transition-colors",
                      Number(amount) === a ? "border-gold-500/60 bg-gold-500/20 text-gold-300" : "border-white/10 bg-white/5 text-muted-foreground",
                    )}
                  >
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Available: ₹{wallet?.balance.toFixed(2) ?? "0.00"}</span>
                <button onClick={() => setAmount(String(wallet?.balance ?? 0))} className="text-gold-400">
                  Max
                </button>
              </div>
              <Button className="mt-4 w-full" size="lg" variant="ghost" onClick={handleWithdraw} disabled={processing}>
                {processing ? "Processing..." : `Withdraw ₹${Number(amount) || 0}`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((t) => {
                  const { icon, color } = txIcon(t.type);
                  const isDebit = t.type === "withdraw" || t.type === "bet";
                  return (
                    <div key={t.id} className="glass flex items-center gap-3 rounded-xl px-3 py-3">
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold capitalize">{t.type}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDateTime(t.created_at)} · {t.status}
                        </p>
                      </div>
                      <span className={cn("text-sm font-bold", color)}>
                        {isDebit ? "-" : "+"}₹{t.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="text-4xl">💳</span>
                <p className="mt-3 text-sm text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showUpi} onOpenChange={setShowUpi}>
          <DialogHeader>
            <DialogTitle>UPI Payment Details</DialogTitle>
            <DialogDescription>Send the amount to this UPI ID and it will be credited instantly.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-gold-500/30 bg-black/40 p-4 text-center">
            <p className="font-mono text-base font-bold text-gold-300">acas@ybl</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Reference: {profile?.referral_code ?? "ACAS"} | Amount: ₹{Number(amount) || 0}</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="flex-1" onClick={() => setShowUpi(false)}>
              Done
            </Button>
          </DialogFooter>
        </Dialog>
      </PageContainer>
    </div>
  );
}
