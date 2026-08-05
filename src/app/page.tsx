"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, QrCode, ArrowRight, Zap, Lock, Globe2, Sparkles } from "lucide-react";
import CertificateCard from "@/components/verify/CertificateCard";
import QRScannerModal from "@/components/verify/QRScannerModal";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/verify?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQRSuccess = (scannedText: string) => {
    router.push(`/verify?query=${encodeURIComponent(scannedText)}`);
  };

  const sampleCert = {
    id: "BC-2026-9821",
    holder_name: "Alex Rivera",
    degree: "Certified Blockchain Security Engineer",
    institution: "BlockCertify Academy & Polygon Labs",
    issue_date: "2026-03-15",
    grade: "First Class with Distinction",
    reg_number: "BC-REG-98210",
    blockchain_hash: "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
    status: "verified" as const,
    txHash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] bg-radial-gradient">
      {/* Background Glow Orbs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF87]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 right-10 w-[400px] h-[250px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Network Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E1626] border border-[#00FF87]/30 text-xs font-mono text-[#00FF87] mb-8 shadow-[0_0_15px_rgba(0,255,135,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
          <span>Polygon Mainnet Protocol Connected</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
          Immutable <span className="gradient-text-neon">Certificate Verification</span> on Blockchain
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Issue, manage, and instantly verify academic & professional credentials using Polygon smart contracts. Unified across Web & Expo Mobile app.
        </p>

        {/* Quick Search Lookup Box */}
        <div className="w-full max-w-2xl mt-10">
          <form
            onSubmit={handleSearch}
            className="p-2 glass-panel-neon rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-[0_0_35px_rgba(0,255,135,0.15)] bg-[#0A0F1D]/90"
          >
            <div className="flex items-center gap-3 px-4 py-3 flex-1 w-full">
              <Search className="w-5 h-5 text-[#00FF87] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Paste Certificate Hash or Reg Number (e.g. 0x7f8a... or BC-REG-98210)"
                className="w-full bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto px-1 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#00FF87] border border-white/10 transition-colors"
                title="Scan QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] flex items-center justify-center gap-2 shrink-0"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="mt-3 text-xs text-slate-400 font-mono">
            Try sample hash: <button onClick={() => setSearchQuery("0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a")} className="text-[#00FF87] underline hover:text-white">0x7f8a9b2c...</button>
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#00FF87]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#00FF87]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-[#00FF87]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cryptographic SHA-256 Hash</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every certificate is hashed using deterministic SHA-256 (`holder + degree + institution + date + reg_number`) and stored in PostgreSQL & Polygon.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#00E5FF]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anyone can verify credentials in milliseconds without requiring login or third-party centralized authority.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shared Express & Postgres Backend</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects directly to the existing Node.js REST API (`http://localhost:5000`) and PostgreSQL database `blockcertify`.
            </p>
          </div>
        </div>

        {/* Live Interactive Preview Section */}
        <div className="mt-24 w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-6">
            <Sparkles className="w-4 h-4 text-[#00FF87]" />
            <span>Interactive On-Chain Certificate Preview</span>
          </div>

          <CertificateCard certificate={sampleCert} />
        </div>

        {/* Stats Counter Section */}
        <div className="mt-24 w-full p-8 glass-panel rounded-3xl border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#00FF87] font-mono">15,400+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono">Certificates Verified</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">&lt; 1 sec</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono">Avg Verification Speed</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#00E5FF] font-mono">100%</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono">Tamper Prevention</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#00FF87] font-mono">Polygon</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono">Mainnet Protocol</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 w-full p-8 sm:p-12 glass-panel-neon rounded-3xl border border-[#00FF87]/40 flex flex-col md:flex-row items-center justify-between gap-6 text-left bg-gradient-to-r from-[#0E1626] via-[#0A0F1D] to-[#0E1626]">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to issue credentials on BlockCertify?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Access the Issuer Portal to issue certificates using your institution account or connect via Google OAuth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/issuer"
              className="px-6 py-3 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.4)]"
            >
              Go to Issuer Portal
            </Link>
            <Link
              href="/verify"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-all"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRSuccess}
      />
    </div>
  );
}
