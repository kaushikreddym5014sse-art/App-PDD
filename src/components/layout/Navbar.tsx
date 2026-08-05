"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LogIn, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import WalletConnectBtn from "../wallet/WalletConnectBtn";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Verify Certificate", href: "/verify" },
    { name: "Issuer Portal", href: "/issuer" },
    { name: "My Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[rgba(255,255,255,0.08)] bg-[#070B14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00FF87] to-[#00E5FF] p-[1.5px] shadow-[0_0_20px_rgba(0,255,135,0.3)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#00FF87] transition-transform duration-300 group-hover:rotate-6" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Block<span className="text-[#00FF87] neon-text-glow">Certify</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
              Polygon Verifier
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0E1626]/80 p-1.5 rounded-full border border-white/10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#00FF87] text-[#070B14] font-semibold shadow-[0_0_15px_rgba(0,255,135,0.4)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="hidden lg:flex items-center gap-3">
          <WalletConnectBtn />
          
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#00FF87]/50 hover:shadow-[0_0_15px_rgba(0,255,135,0.15)]"
          >
            <LogIn className="w-4 h-4 text-[#00FF87]" />
            <span>Sign In</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0F1D] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#00FF87] text-[#070B14] font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <WalletConnectBtn />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white bg-white/10 border border-white/10"
            >
              <LogIn className="w-4 h-4 text-[#00FF87]" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
