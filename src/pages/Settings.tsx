import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { Bell, BellRing, Eye, EyeOff, Moon, Palette, Shield, Smartphone, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-gold-500" : "bg-white/15"}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  right,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc?: string;
  right: ReactNode;
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-xl px-4 py-3.5">
      <Icon className="h-4 w-4 text-gold-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {desc && <p className="text-[10px] text-muted-foreground">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export default function Settings() {
  const { user, updateProfile, signOut } = useAuth();
  const [push, setPush] = useState(true);
  const [sound, setSound] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await updateProfile({});
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <Header title="Settings" />
      <PageContainer className="space-y-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <SettingRow icon={Bell} title="Push Notifications" desc="Bonuses, wins & promos" right={<Toggle checked={push} onChange={setPush} />} />
          <SettingRow icon={BellRing} title="Win Alerts" desc="Instant win notifications" right={<Toggle checked={true} onChange={() => {}} />} />
          <SettingRow icon={Volume2} title="Sound Effects" desc="Game audio feedback" right={<Toggle checked={sound} onChange={setSound} />} />
          <SettingRow icon={Eye} title="Hide Balance" desc="Privacy mode for balance" right={<Toggle checked={hideBalance} onChange={setHideBalance} />} />
          <SettingRow icon={Palette} title="Dark Mode" desc="Premium dark theme" right={<Toggle checked={darkMode} onChange={setDarkMode} />} />
          <SettingRow icon={Moon} title="Reduce Motion" desc="Minimize animations" right={<Toggle checked={false} onChange={() => {}} />} />
          <SettingRow icon={Smartphone} title="Biometric Login" desc="Use fingerprint / face ID" right={<Toggle checked={false} onChange={() => {}} />} />
          <SettingRow icon={Shield} title="Two-Factor Auth" desc="Extra account security" right={<Toggle checked={false} onChange={() => {}} />} />
        </motion.div>

        <div className="glass rounded-xl p-4">
          <p className="text-sm font-semibold">Account</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" onClick={save}>
              {saved ? "Saved ✓" : "Save Changes"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await signOut();
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          ACAS Casino v1.0.0 · 18+ only · Play responsibly
        </p>
      </PageContainer>
    </div>
  );
}
