"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, QrCode, ShieldCheck, AlertCircle, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Certificate, VerificationResult } from "@/types/certificate";
import CertificateCard from "@/components/verify/CertificateCard";
import QRScannerModal from "@/components/verify/QRScannerModal";
import AuthGuard from "@/components/auth/AuthGuard";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fraudInfo, setFraudInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handlePerformVerification(initialQuery);
    }
  }, [initialQuery]);

  const handlePerformVerification = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setFraudInfo(null);

    try {
      const res = await apiClient.verifyHash(searchStr.trim());
      setResult(res);

      if (res.certificate && res.certificate.id) {
        try {
          const fraudData = await apiClient.checkFraud(res.certificate.id);
          setFraudInfo(fraudData);
        } catch {
          // Non-critical
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify certificate on-chain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformVerification(query);
  };

  const handleQRSuccess = (scannedText: string) => {
    setQuery(scannedText);
    handlePerformVerification(scannedText);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono text-[#00FF87] mb-4">
        <ShieldCheck className="w-4 h-4" />
        <span>PostgreSQL & Polygon Certificate Verifier</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white text-center tracking-tight mb-3">
        Verify <span className="gradient-text-neon">Certificate Authenticity</span>
      </h1>
      <p className="text-slate-400 text-sm sm:text-base text-center max-w-xl mb-8">
        Enter a SHA-256 blockchain hash, Registration Number, or scan a QR code to confirm certificate authenticity.
      </p>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl p-2 glass-panel-neon rounded-2xl flex flex-col sm:flex-row items-center gap-2 mb-10 bg-[#0A0F1D]/90"
      >
        <div className="flex items-center gap-3 px-4 py-3 flex-1 w-full">
          <Search className="w-5 h-5 text-[#00FF87] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter SHA-256 Certificate Hash (e.g. 0x7f8a9b2c...)"
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
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Database...</span>
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="w-full max-w-2xl p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm mb-8">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verification Result Display */}
      {result && result.certificate ? (
        <CertificateCard
          certificate={result.certificate}
          fraudDetails={fraudInfo}
        />
      ) : result && !result.found ? (
        <div className="w-full max-w-2xl p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-rose-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Certificate Not Found</h3>
          <p className="text-xs text-slate-400 max-w-md">
            No matching certificate record was found for the hash specified. The certificate may be invalid or tampered with.
          </p>
        </div>
      ) : !isLoading && !errorMsg ? (
        <div className="w-full max-w-2xl p-12 glass-panel rounded-3xl border border-white/10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Ready for Verification</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Enter a certificate hash or scan a QR code above to perform an instant database and cryptographic verification check.
          </p>
          <button
            onClick={() => {
              setQuery("0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a");
              handlePerformVerification("0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a");
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#00FF87]"
          >
            Demo Search: 0x7f8a9b2c...
          </button>
        </div>
      ) : null}

      {/* QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRSuccess}
      />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="w-full py-20 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#00FF87]" />
          <span>Loading Verification Portal...</span>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </AuthGuard>
  );
}
