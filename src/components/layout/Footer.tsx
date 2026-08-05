import Link from "next/link";
import { ShieldCheck, ExternalLink, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#05080F] border-t border-white/10 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00FF87] to-[#00E5FF] p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#070B14] rounded-[7px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#00FF87]" />
                </div>
              </div>
              <span className="text-lg font-bold text-white">
                Block<span className="text-[#00FF87]">Certify</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decentralized, tamper-proof certificate issuance and verification protocol built on Polygon. Unified across Web & Expo Mobile platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#00FF87] bg-[#00FF87]/10 px-3 py-1.5 rounded-lg border border-[#00FF87]/20 w-fit">
              <Cpu className="w-3.5 h-3.5" />
              <span>Polygon Mainnet RPC Connected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#00FF87] transition-colors">Overview</Link></li>
              <li><Link href="/verify" className="hover:text-[#00FF87] transition-colors">Verify Certificate</Link></li>
              <li><Link href="/issuer" className="hover:text-[#00FF87] transition-colors">Issuer Portal</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#00FF87] transition-colors">My Certificates</Link></li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://polygonscan.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#00FF87] transition-colors">
                  <span>Polygon Explorer</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="http://localhost:5000" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#00FF87] transition-colors">
                  <span>Node.js REST API</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li><span className="text-slate-500">PostgreSQL "blockcertify" DB</span></li>
              <li><span className="text-slate-500">Expo App: com.dhanushravi.BlockCertify</span></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Trust & Security</h4>
            <p className="text-xs text-slate-400">
              Certificates are cryptographically hashed and immutably pinned to Polygon smart contracts. Verification requires zero third-party trust.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BlockCertify Protocol. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
