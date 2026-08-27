"use client";

import { useState, useEffect } from "react";
import { Award, Plus, ShieldCheck, Check, AlertCircle, Loader2, FileSpreadsheet, Send, FileText } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Certificate, IssueCertificatePayload } from "@/types/certificate";
import { formatDate, shortenHash } from "@/lib/utils";
import AuthGuard from "@/components/auth/AuthGuard";

function IssuerDashboardContent() {
  const [activeTab, setActiveTab] = useState<"issue" | "history" | "bulk">("issue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCert, setSuccessCert] = useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<IssueCertificatePayload>({
    holder_name: "",
    degree: "",
    institution: "",
    issue_date: new Date().toISOString().split("T")[0],
    grade: "",
    reg_number: "",
  });

  const [issuedHistory, setIssuedHistory] = useState<Certificate[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await apiClient.getIssuanceHistory();
      if (data && data.certificates) {
        setIssuedHistory(data.certificates);
      }
    } catch (err) {
      console.warn("Failed to fetch issuance history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    if (!formData.holder_name || !formData.degree || !formData.institution || !formData.issue_date) {
      setErrorMsg("Holder Name, Degree, Institution, and Issue Date are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessCert(null);

    try {
      const result = await apiClient.issueCertificate(formData);
      if (result && result.certificate) {
        setSuccessCert(result.certificate);
        
        // Optimistically update Issuance History state immediately
        setIssuedHistory((prev) => {
          const map = new Map<string, Certificate>();
          [result.certificate, ...prev].forEach((item) => {
            const key = item.id || item.blockchain_hash;
            if (key && !map.has(key)) map.set(key, item);
          });
          return Array.from(map.values());
        });

        // Broadcast update event so Dashboard updates in real time if open
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("certificate_issued"));
        }

        // Reset form
        setFormData({
          holder_name: "",
          degree: "",
          institution: "",
          issue_date: new Date().toISOString().split("T")[0],
          grade: "",
          reg_number: "",
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to issue certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#00FF87] px-2.5 py-0.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30">
              Institution Authority Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Certificate <span className="gradient-text-neon">Issuance Hub</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-[#0E1626] rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("issue")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "issue"
                ? "bg-[#00FF87] text-[#070B14]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Issue Single</span>
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "bulk"
                ? "bg-[#00FF87] text-[#070B14]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Batch Upload</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              fetchHistory();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-[#00FF87] text-[#070B14]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Issuance History ({issuedHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === "issue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issue Form */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0B1220]">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00FF87]" />
              <span>Issue New Academic / Professional Certificate</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Submits certificate parameters to Express REST API endpoint (`/api/certificates/issue`) and generates a SHA-256 hash.
            </p>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Holder Name *
                  </label>
                  <input
                    type="text"
                    name="holder_name"
                    value={formData.holder_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Rivera"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Degree / Qualification *
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    placeholder="e.g. Bachelor of Computer Science"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Issuing Institution *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="e.g. BlockCertify Institute"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Grade / Marks (Optional)
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    placeholder="e.g. A+ or First Class"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Registration / Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="reg_number"
                    value={formData.reg_number}
                    onChange={handleInputChange}
                    placeholder="e.g. REG-982104"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-[#00FF87] outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating SHA-256 Hash & Registering...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Issue Certificate to Backend & Registry</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Side Success & Guidance Panel */}
          <div className="space-y-6">
            {successCert ? (
              <div className="glass-panel-neon p-6 rounded-3xl border border-[#00FF87]/40 bg-[#070B14]">
                <div className="w-10 h-10 rounded-xl bg-[#00FF87]/10 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-[#00FF87]" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Certificate Issued!</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Stored in PostgreSQL database with deterministic SHA-256 hash.
                </p>

                <div className="space-y-2 text-xs font-mono p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                  <div><span className="text-slate-500">ID:</span> <span className="text-white">{successCert.id}</span></div>
                  <div><span className="text-slate-500">Holder:</span> <span className="text-white">{successCert.holder_name}</span></div>
                  <div><span className="text-slate-500">Hash:</span> <span className="text-[#00E5FF]">{shortenHash(successCert.blockchain_hash)}</span></div>
                  <div><span className="text-slate-500">Status:</span> <span className="text-[#00FF87]">{successCert.status?.toUpperCase() || "VERIFIED"}</span></div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("history");
                    fetchHistory();
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
                >
                  View in Issuance History →
                </button>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-[#0B1220]">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00FF87]" />
                  <span>SHA-256 Hash Algorithm</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon submission, the Express backend generates a SHA-256 hash derived from:
                </p>
                <code className="block mt-3 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#00FF87] font-mono leading-relaxed">
                  SHA-256(holder + degree + institution + date + reg_number)
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-[#0B1220] max-w-2xl mx-auto text-center">
          <FileSpreadsheet className="w-12 h-12 text-[#00FF87] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Batch CSV Certificate Issuance</h3>
          <p className="text-xs text-slate-400 mb-6">
            Upload a CSV file containing multiple student records to issue certificates in bulk.
          </p>

          <input
            type="file"
            accept=".csv"
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00FF87] file:text-[#070B14] hover:file:bg-[#00E67A] cursor-pointer mb-4"
          />
        </div>
      )}

      {activeTab === "history" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0B1220]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Issued Certificates Register</h3>
              <p className="text-xs text-slate-400">All credentials generated and stored in PostgreSQL database</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              Total: {issuedHistory.length}
            </span>
          </div>

          {isLoadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#00FF87]" />
              <span className="text-xs font-mono">Loading Issuance History...</span>
            </div>
          ) : issuedHistory.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400 border border-dashed border-white/10 rounded-2xl">
              <FileText className="w-8 h-8 text-slate-500 mb-1" />
              <span className="text-sm font-semibold text-slate-300">No certificates issued yet</span>
              <span className="text-xs text-slate-500 max-w-sm">Use the "Issue Single" tab above to issue your institution's first certificate.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase font-mono tracking-wider">
                    <th className="px-6 py-3">Cert ID</th>
                    <th className="px-6 py-3">Holder Name</th>
                    <th className="px-6 py-3">Degree</th>
                    <th className="px-6 py-3">Issue Date</th>
                    <th className="px-6 py-3">SHA-256 Hash</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {issuedHistory.map((cert) => (
                    <tr key={cert.id || cert.blockchain_hash} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#00FF87]">
                        {cert.id ? (cert.id.startsWith("BC-") ? cert.id : `BC-${cert.id.slice(0, 6)}`) : "BC-CERT"}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{cert.holder_name}</td>
                      <td className="px-6 py-4 text-slate-300">{cert.degree}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(cert.issue_date)}</td>
                      <td className="px-6 py-4 font-mono text-[#00E5FF]">
                        {shortenHash(cert.blockchain_hash)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30">
                          {cert.status?.toUpperCase() || "VERIFIED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function IssuerDashboard() {
  return (
    <AuthGuard>
      <IssuerDashboardContent />
    </AuthGuard>
  );
}
