"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, Upload, AlertCircle } from "lucide-react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { fps: 10, qrbox: { width: 220, height: 220 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          scanner.clear();
          onClose();
        },
        (errorMessage) => {
          // Continuous scan error (normal when no QR code is in frame)
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [isOpen, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const html5QrCode = new Html5Qrcode("qr-file-dummy");
      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText);
      onClose();
    } catch (err: any) {
      setError("No valid certificate QR code detected in the uploaded image.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-[#0A0F1D] max-w-lg glass-panel-neon rounded-2xl p-6 relative border border-[#00FF87]/30 shadow-2xl bg-[#0B1220]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#00FF87]" />
          <span>Scan Certificate QR Code</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Point your webcam at a BlockCertify QR code or upload a certificate QR image.
        </p>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "camera"
                ? "bg-[#00FF87] text-[#070B14]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Webcam Scanner
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-[#00FF87] text-[#070B14]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Upload QR Image
          </button>
        </div>

        {/* Camera View */}
        {activeTab === "camera" && (
          <div className="w-full min-h-[260px] bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-white/10 p-2">
            <div id="qr-reader-container" className="w-full text-slate-300" />
          </div>
        )}

        {/* Upload View */}
        {activeTab === "upload" && (
          <div className="w-full h-[260px] border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-[#00FF87]/50 transition-colors">
            <Upload className="w-10 h-10 text-[#00FF87] mb-3 animate-bounce" />
            <p className="text-sm font-medium text-white mb-1">Upload Certificate QR Image</p>
            <p className="text-xs text-slate-400 mb-4">Supports PNG, JPG, WEBP</p>

            <label className="px-4 py-2 rounded-xl bg-[#00FF87] text-[#070B14] font-semibold text-xs cursor-pointer hover:bg-[#00E67A] transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)]">
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <div id="qr-file-dummy" className="hidden" />
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
