"use client";

import { useState, useEffect } from "react";
import { Award, Plus, Upload, ShieldCheck, Check, AlertCircle, Loader2, FileSpreadsheet, Send } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Certificate, IssueCertificatePayload } from "@/types/certificate";
import { formatDate, shortenHash } from "@/lib/utils";
import AuthGuard from "@/components/auth/AuthGuard";

function IssuerDashboardContent() {
  const [activeTab, setActiveTab] = useState<"issue" | "history" | "bulk">("issue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCert, setSuccessCert] = useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiClient.listCertificates();
      if (data && data.length > 0) {
        setIssuedHistory((prev) => {
          const map = new Map<string, Certificate>();
          [...data, ...prev].forEach((item) => {
            const key = item.id || item.blockchain_hash;
            if (key && !map.has(key)) map.set(key, item);
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn("Failed to fetch issuance history:", err);
    }
  };

  const [formData, setFormData] = useState<IssueCertificatePayload>({
    holder_name: "",
    degree: "",
    institution: "",
    issue_date: new Date().toISOString().split("T")[0],
    grade: "",
    reg_number: "",
  });

  const [issuedHistory, setIssuedHistory] = useState<Certificate[]>([
    {
      id: "BC-2026-9821",
      holder_name: "Alex Rivera",
      degree: "Certified Blockchain Security Engineer",
      institution: "BlockCertify Academy",
      issue_date: "2026-03-15",
      grade: "First Class Distinction",
      reg_number: "REG-98210",
      blockchain_hash: "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      status: "verified",
      txHash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    },
    {
      id: "BC-2026-4410",
      holder_name: "Sophia Chen",
      degree: "Polygon Smart Contract Auditor",
      institution: "Polygon Guild Labs",
      issue_date: "2026-02-10",
      grade: "A+",
      reg_number: "REG-44102",
      blockchain_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      status: "verified",
      txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.holder_name || !formData.degree || !formData.institution || !formData.issue_date) {
      setErrorMsg("Holder Name, Degree, Institution, and Issue Date are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessCert(null);

    try {
      const result = await apiClient.issueCertificate(formData);
      if (result.certificate) {
        setSuccessCert(result.certificate);
        setIssuedHistory((prev) => {
          const map = new Map<string, Certificate>();
          [result.certificate, ...prev].forEach((item) => {
            const key = item.id || item.blockchain_hash;
            if (key && !map.has(key)) map.set(key, item);
          });
          return Array.from(map.values());
        });
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
            onClick={() => setActiveTab("history")}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-[#00FF87] outline-none transition-colors"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-[#00FF87] outline-none transition-colors"
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
                className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
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

                <div className="space-y-2 p-3 rounded-xl bg-white/5 text-xs font-mono">
                  <p className="text-slate-300">ID: <span className="text-[#00FF87]">{successCert.id}</span></p>
                  <p className="text-slate-300">Holder: {successCert.holder_name}</p>
                  <p className="text-slate-300">Hash: {shortenHash(successCert.blockchain_hash)}</p>
                </div>

                <a
                  href={`/verify?query=${successCert.blockchain_hash || successCert.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block text-center py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  View Verification Record →
                </a>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00FF87]" />
                  <span>SHA-256 Hash Algorithm</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon submission, the Express backend generates a SHA-256 hash derived from:
                  <br />
                  <code className="text-[#00FF87] font-mono text-[11px]">SHA-256(holder + degree + institution + date + reg_number)</code>
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-[#00FF87]">
                  Target API: http://localhost:5000/api/certificates/issue
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Upload Tab */}
      {activeTab === "bulk" && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#00FF87]/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-[#00FF87]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Batch CSV Certificate Upload</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Upload a structured CSV containing recipient names, degrees, and registration numbers to issue multiple certificates in bulk.
          </p>

          <label className="px-6 py-3 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-xs cursor-pointer transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)]">
            Upload CSV File
            <input type="file" accept=".csv, .json" className="hidden" />
          </label>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Issued Certificates Register</h3>
            <span className="text-xs font-mono text-slate-400">Total: {issuedHistory.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070B14] text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Cert ID</th>
                  <th className="px-6 py-4">Holder Name</th>
                  <th className="px-6 py-4">Degree</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">SHA-256 Hash</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {issuedHistory.map((cert) => (
                  <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#00FF87]">{cert.id}</td>
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
