"use client";

import { useState } from "react";
import { Certificate } from "@/types/certificate";
import { ShieldCheck, Copy, Check, ExternalLink, Calendar, User, Award, Download, FileJson, Lock, AlertTriangle } from "lucide-react";
import { formatDate, shortenAddress, shortenHash } from "@/lib/utils";
import confetti from "canvas-confetti";

interface CertificateCardProps {
  certificate: Certificate;
  fraudDetails?: {
    fraud_score?: number;
    risk_level?: string;
    status?: string;
    verdict?: string;
  };
}

export default function CertificateCard({ certificate, fraudDetails }: CertificateCardProps) {
  const [copied, setCopied] = useState(false);

  const certHash = certificate.blockchain_hash || certificate.id;

  const handleCopyHash = () => {
    if (certHash) {
      navigator.clipboard.writeText(certHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00FF87", "#00E5FF", "#FFFFFF"],
    });
  };

  const isVerified = certificate.status === "verified";

  return (
    <div className="w-full max-w-3xl glass-panel-neon rounded-3xl p-6 sm:p-8 relative border border-[#00FF87]/40 shadow-[0_0_50px_rgba(0,255,135,0.12)] bg-gradient-to-b from-[#0F172A] to-[#0A0F1D]">
      {/* Top Banner Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.25)]">
            <ShieldCheck className="w-7 h-7 text-[#00FF87]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#00FF87] uppercase">
                {certificate.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isVerified
                  ? "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? "bg-[#00FF87] animate-pulse" : "bg-amber-400"}`} />
                {certificate.status?.toUpperCase() || "VERIFIED"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {certificate.degree}
            </h2>
          </div>
        </div>

        <button
          onClick={triggerConfetti}
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
        >
          Verify Proof 🎉
        </button>
      </div>

      {/* Recipient & Issuer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-5 rounded-2xl bg-[#070B14]/60 border border-white/5">
        <div className="space-y-1">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#00FF87]" />
            <span>Certificate Holder</span>
          </p>
          <p className="text-base font-semibold text-white">{certificate.holder_name}</p>
          {certificate.reg_number && (
            <p className="text-xs text-slate-400 font-mono">Reg #: {certificate.reg_number}</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Issuing Institution</span>
          </p>
          <p className="text-base font-semibold text-white">{certificate.institution}</p>
          {certificate.grade && (
            <p className="text-xs text-slate-400">Grade / Performance: <span className="text-[#00FF87] font-semibold">{certificate.grade}</span></p>
          )}
        </div>
      </div>

      {/* Fraud Risk Indicator if checked */}
      {fraudDetails && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Fraud Score Assessment:</span>
            <span className="font-mono text-white font-bold">{fraudDetails.fraud_score ?? 0}/100</span>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {fraudDetails.verdict || "AUTHENTIC"}
          </span>
        </div>
      )}

      {/* Cryptographic Proof Details */}
      <div className="space-y-3 p-4 rounded-2xl bg-[#0E1626] border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00FF87]" />
            <span>SHA-256 Blockchain Hash</span>
          </span>
          <button
            onClick={handleCopyHash}
            className="flex items-center gap-1.5 text-xs text-[#00FF87] hover:underline font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{shortenHash(certHash)}</span>
              </>
            )}
          </button>
        </div>

        {certificate.txHash && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
            <span className="text-xs text-slate-400">Polygon Explorer Link</span>
            <a
              href={`https://polygonscan.com/tx/${certificate.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[#00E5FF] hover:underline font-mono"
            >
              <span>{shortenHash(certificate.txHash)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Issue Date: {formatDate(certificate.issue_date)}</span>
          </span>
          <span className="font-mono text-slate-400">
            Reg: {certificate.reg_number || "N/A"}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00FF87]" />
            <span>Download PDF / Print</span>
          </button>
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificate, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `certificate_${certificate.id}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
          >
            <FileJson className="w-4 h-4 text-[#00E5FF]" />
            <span>Export JSON</span>
          </button>
        </div>

        <a
          href={certificate.txHash ? `https://polygonscan.com/tx/${certificate.txHash}` : "#"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#00FF87] hover:text-[#00E67A] font-semibold"
        >
          <span>View Protocol Record</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
