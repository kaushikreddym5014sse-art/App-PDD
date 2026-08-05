"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  KeyRound,
  UserCheck
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import WalletConnectBtn from "@/components/wallet/WalletConnectBtn";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"user" | "institution" | "employer">("user");
  const [regInstitution, setRegInstitution] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await apiClient.login(loginEmail, loginPassword);
      setSuccessMsg("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await apiClient.register({
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        institution: regInstitution,
      });
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center px-4 py-12 bg-radial-gradient">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00FF87]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[200px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Auth Container */}
      <div className="w-full max-w-lg glass-panel-neon rounded-3xl p-6 sm:p-10 border border-[#00FF87]/30 shadow-[0_0_50px_rgba(0,255,135,0.15)] bg-[#0B1220]/95 backdrop-blur-2xl relative overflow-hidden">
        {/* Header Branding */}
        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00FF87] to-[#00E5FF] p-[1.5px] mx-auto mb-4 shadow-[0_0_25px_rgba(0,255,135,0.35)] transition-transform hover:scale-105">
            <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#00FF87]" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to <span className="gradient-text-neon">BlockCertify</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Decentralized Certificate Protocol Authentication
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 bg-[#070B14] rounded-2xl border border-white/10 mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "login"
                ? "bg-[#00FF87] text-[#070B14] shadow-[0_0_15px_rgba(0,255,135,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "register"
                ? "bg-[#00FF87] text-[#070B14] shadow-[0_0_15px_rgba(0,255,135,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/30 flex items-center gap-2.5 text-[#00FF87] text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.35)] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Account Role Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRegRole("user")}
                className={`py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                  regRole === "user"
                    ? "bg-[#00FF87]/10 text-[#00FF87] border-[#00FF87]"
                    : "bg-white/5 text-slate-400 border-white/10"
                }`}
              >
                Student / User
              </button>
              <button
                type="button"
                onClick={() => setRegRole("institution")}
                className={`py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                  regRole === "institution"
                    ? "bg-[#00FF87]/10 text-[#00FF87] border-[#00FF87]"
                    : "bg-white/5 text-slate-400 border-white/10"
                }`}
              >
                Institution
              </button>
              <button
                type="button"
                onClick={() => setRegRole("employer")}
                className={`py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                  regRole === "employer"
                    ? "bg-[#00FF87]/10 text-[#00FF87] border-[#00FF87]"
                    : "bg-white/5 text-slate-400 border-white/10"
                }`}
              >
                Employer
              </button>
            </div>

            {regRole === "institution" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institution Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="e.g. BlockCertify University"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B14] border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.35)] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create BlockCertify Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Web3 Wallet Section */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider mb-1">
            Or Connect Web3 Wallet
          </p>
          <WalletConnectBtn />
        </div>
      </div>
    </div>
  );
}
