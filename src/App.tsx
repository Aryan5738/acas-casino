import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { FullScreenLoader } from "./components/ui/feedback";
import { ProtectedRoute, GuestRoute, AdminRoute } from "./components/shared/RouteGuards";

const Splash = lazy(() => import("./pages/Splash"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Games = lazy(() => import("./pages/Games"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Promotions = lazy(() => import("./pages/Promotions"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));

const Mines = lazy(() => import("./pages/games/Mines"));
const Roulette = lazy(() => import("./pages/games/Roulette"));
const Dice = lazy(() => import("./pages/games/Dice"));
const CoinFlip = lazy(() => import("./pages/games/CoinFlip"));
const Plinko = lazy(() => import("./pages/games/Plinko"));
const WheelSpin = lazy(() => import("./pages/games/WheelSpin"));
const Crash = lazy(() => import("./pages/games/Crash"));
const HiLo = lazy(() => import("./pages/games/HiLo"));
const Keno = lazy(() => import("./pages/games/Keno"));
const DragonTower = lazy(() => import("./pages/games/DragonTower"));
const Blackjack = lazy(() => import("./pages/games/Blackjack"));
const Poker = lazy(() => import("./pages/games/Poker"));
const Baccarat = lazy(() => import("./pages/games/Baccarat"));
const Slots = lazy(() => import("./pages/games/Slots"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

function SuspensePage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FullScreenLoader />}>{children}</Suspense>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<SuspensePage><Splash /></SuspensePage>} />
      <Route path="/welcome" element={<SuspensePage><Welcome /></SuspensePage>} />
      <Route path="/login" element={<SuspensePage><GuestRoute><Login /></GuestRoute></SuspensePage>} />
      <Route path="/register" element={<SuspensePage><GuestRoute><Register /></GuestRoute></SuspensePage>} />
      <Route path="/forgot-password" element={<SuspensePage><ForgotPassword /></SuspensePage>} />
      <Route path="/reset-password" element={<SuspensePage><ResetPassword /></SuspensePage>} />
      <Route path="/verify-email" element={<SuspensePage><VerifyEmail /></SuspensePage>} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<SuspensePage><ProtectedRoute><Dashboard /></ProtectedRoute></SuspensePage>} />
        <Route path="/games" element={<SuspensePage><ProtectedRoute><Games /></ProtectedRoute></SuspensePage>} />
        <Route path="/wallet" element={<SuspensePage><ProtectedRoute><Wallet /></ProtectedRoute></SuspensePage>} />
        <Route path="/leaderboard" element={<SuspensePage><ProtectedRoute><Leaderboard /></ProtectedRoute></SuspensePage>} />
        <Route path="/promotions" element={<SuspensePage><ProtectedRoute><Promotions /></ProtectedRoute></SuspensePage>} />
        <Route path="/profile" element={<SuspensePage><ProtectedRoute><Profile /></ProtectedRoute></SuspensePage>} />
        <Route path="/settings" element={<SuspensePage><ProtectedRoute><Settings /></ProtectedRoute></SuspensePage>} />
        <Route path="/notifications" element={<SuspensePage><ProtectedRoute><Notifications /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/mines" element={<SuspensePage><ProtectedRoute><Mines /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/roulette" element={<SuspensePage><ProtectedRoute><Roulette /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/dice" element={<SuspensePage><ProtectedRoute><Dice /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/coinflip" element={<SuspensePage><ProtectedRoute><CoinFlip /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/plinko" element={<SuspensePage><ProtectedRoute><Plinko /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/wheelspin" element={<SuspensePage><ProtectedRoute><WheelSpin /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/crash" element={<SuspensePage><ProtectedRoute><Crash /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/hilo" element={<SuspensePage><ProtectedRoute><HiLo /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/keno" element={<SuspensePage><ProtectedRoute><Keno /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/dragontower" element={<SuspensePage><ProtectedRoute><DragonTower /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/blackjack" element={<SuspensePage><ProtectedRoute><Blackjack /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/poker" element={<SuspensePage><ProtectedRoute><Poker /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/baccarat" element={<SuspensePage><ProtectedRoute><Baccarat /></ProtectedRoute></SuspensePage>} />
        <Route path="/games/slots" element={<SuspensePage><ProtectedRoute><Slots /></ProtectedRoute></SuspensePage>} />
      </Route>

      <Route path="/admin/login" element={<SuspensePage><AdminLogin /></SuspensePage>} />
      <Route path="/admin" element={<SuspensePage><AdminRoute><AdminDashboard /></AdminRoute></SuspensePage>} />

      <Route path="*" element={<SuspensePage><Welcome /></SuspensePage>} />
    </Routes>
  );
}
