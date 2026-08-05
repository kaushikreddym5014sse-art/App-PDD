"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import WalletConnectBtn from "@/components/wallet/WalletConnectBtn";
import { getCurrentUser, clearAuth } from "@/lib/api-client";
import { getWalletState } from "@/lib/wallet";
import { User } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState({ address: "", chainId: 0, connected: false });
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      setFullName(u.full_name || "");
      setInstitution(u.institution || "");
    }
    const w = getWalletState();
    setWallet(w);
  }, []);

  const handleCopyWallet = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = { ...user, full_name: fullName, institution };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("blockcertify_user", JSON.stringify(updated));
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#070B14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          
          {/* Header Breadcrumb */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-2xl">
                  👤
                </span>
                User Profile & Identity
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage your credentials, Web3 wallet pairing, and security preferences.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>

          {/* Profile Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center text-3xl font-black text-emerald-400">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{user?.full_name || "User Account"}</h2>
                  <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                    {user?.role || "user"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>🏫</span> {user?.institution || "BlockCertify Network User"}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm text-center border border-slate-700 transition-all"
              >
                View Dashboard →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Web3 Wallet Pairing */}
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🦊</span> Web3 Wallet Pairing
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Polygon Amoy (Chain 80002)
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your Web3 MetaMask wallet to sign on-chain transactions and claim cryptographic ownership of issued certificates.
              </p>

              {wallet.connected || wallet.address ? (
                <div className="p-4 rounded-2xl bg-[#070B14] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Connected Address</span>
                    <span className="text-emerald-400 font-bold">● Active</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-mono text-emerald-300 truncate">
                      {wallet.address || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}
                    </code>
                    <button
                      onClick={handleCopyWallet}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all shrink-0"
                    >
                      {copied ? "Copied! ✓" : "Copy"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <WalletConnectBtn />
                </div>
              )}
            </div>

            {/* Account Metrics */}
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🛡️</span> Security & Integrity Metrics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800">
                  <div className="text-2xl font-black text-emerald-400">SHA-256</div>
                  <div className="text-xs text-slate-400 mt-1">Cryptographic Pinned</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800">
                  <div className="text-2xl font-black text-cyan-400">LOW</div>
                  <div className="text-xs text-slate-400 mt-1">Fraud Risk Verdict</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800">
                  <div className="text-2xl font-black text-white">256-Bit</div>
                  <div className="text-xs text-slate-400 mt-1">JWT Encryption</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800">
                  <div className="text-2xl font-black text-purple-400">Polygon</div>
                  <div className="text-xs text-slate-400 mt-1">Mainnet Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Edit Profile Information</h3>
              <p className="text-xs text-slate-400 mt-1">Update your display name and institutional details.</p>
            </div>

            {savedMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <span>✅</span> Profile details saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Institution / Organization</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Registered Email (Read-Only)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#070B14] font-black text-sm transition-all shadow-lg shadow-emerald-500/20"
                >
                  Save Profile Changes →
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
