"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, LogIn, Menu, X, LogOut, User as UserIcon, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import WalletConnectBtn from "../wallet/WalletConnectBtn";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("blockcertify_jwt") || localStorage.getItem("blockcertify_token");
      const rawUser = localStorage.getItem("blockcertify_user");

      if (token && rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          if (parsed && parsed.email) {
            setUser(parsed);
            setIsLoggedIn(true);
            return;
          }
        } catch {
          // parse error fallback
        }
      }
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => checkAuth();
    if (typeof window !== "undefined") {
      window.addEventListener("auth_state_changed", handleAuthChange);
      window.addEventListener("storage", handleAuthChange);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth_state_changed", handleAuthChange);
        window.removeEventListener("storage", handleAuthChange);
      }
    };
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth_state_changed"));
    }
    router.push("/login");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Verify Certificate", href: "/verify" },
    { name: "Issuer Portal", href: "/issuer" },
    { name: "My Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[rgba(255,255,255,0.08)] bg-[#070B14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={isLoggedIn ? "/" : "/login"} className="flex items-center gap-3 group">
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

        {/* Navigation Links — Only visible after user logs in */}
        {isLoggedIn ? (
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
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30">
            <ShieldAlert className="w-4 h-4" />
            <span>Authentication Required — Sign In First</span>
          </div>
        )}

        {/* Right Action Bar */}
        <div className="hidden lg:flex items-center gap-3">
          <WalletConnectBtn />

          {isLoggedIn && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#00FF87]/20 flex items-center justify-center text-[#00FF87]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{user.full_name || "User"}</span>
                  <span className="text-[9px] font-mono text-[#00FF87] leading-tight uppercase">{user.role || "member"}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#070B14] bg-[#00FF87] hover:bg-[#00E67A] transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        {isLoggedIn && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && isLoggedIn && (
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user?.full_name})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
