"use client";

import { useState } from "react";
import { Wallet, Check, ChevronDown, LogOut, ShieldAlert } from "lucide-react";
import { connectMetaMask } from "@/lib/wallet";
import { shortenAddress } from "@/lib/utils";

export default function WalletConnectBtn() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const res = await connectMetaMask();
      setAddress(res.address);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setDropdownOpen(false);
  };

  if (address) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0E1626] border border-[#00FF87]/30 text-white hover:border-[#00FF87] transition-all shadow-[0_0_12px_rgba(0,255,135,0.15)]"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#00FF87] animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-200">
            {shortenAddress(address)}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30 font-semibold">
            Polygon
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl p-2 z-50 border border-white/10 shadow-2xl bg-[#070B14]">
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <p className="text-[10px] uppercase font-mono text-slate-400">Connected Wallet</p>
              <p className="text-xs font-mono text-white truncate">{address}</p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span>{copied ? "Copied Address!" : "Copy Address"}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-[#00FF87]" /> : null}
            </button>

            <a
              href={`https://polygonscan.com/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <span>View on Polygonscan</span>
            </a>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1 border-t border-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#070B14] bg-[#00FF87] hover:bg-[#00E67A] transition-all shadow-[0_0_20px_rgba(0,255,135,0.35)] hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
      </button>

      {errorMsg && (
        <div className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span className="truncate">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
