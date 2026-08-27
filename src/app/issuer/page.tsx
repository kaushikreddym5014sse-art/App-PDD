"use client";

import { useState, useEffect } from "react";
import { Award, Plus, ShieldCheck, Check, AlertCircle, Loader2, FileSpreadsheet, Send, FileText, Download } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Certificate, IssueCertificatePayload } from "@/types/certificate";
import { formatDate, shortenHash } from "@/lib/utils";
import AuthGuard from "@/components/auth/AuthGuard";

function IssuerDashboardContent() {
  const [activeTab, setActiveTab] = useState<"issue" | "history" | "bulk">("issue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCert, setSuccessCert] = useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bulk CSV state
  const [bulkRecords, setBulkRecords] = useState<IssueCertificatePayload[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const [bulkErrorMsg, setBulkErrorMsg] = useState<string | null>(null);

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

  const handleDownloadSampleCsv = () => {
    const csvContent =
      "Holder Name,Degree,Institution,Issue Date,Grade,Registration Number\n" +
      "Sophia Martinez,B.Sc. Cyber Security,BlockCertify Academy,2026-05-10,First Class with Distinction,BC-REG-991201\n" +
      "Marcus Vance,M.S. Distributed Systems,Polygon Guild Labs,2026-06-14,High Distinction,BC-REG-991202\n" +
      "Aria Thorne,Certified Cryptographer,CyberSec Institute,2026-07-01,First Class,BC-REG-991203\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "blockcertify_batch_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkSuccessMsg(null);
    setBulkErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setBulkErrorMsg("CSV file is empty or missing data rows.");
          return;
        }

        const parsed: IssueCertificatePayload[] = [];
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length >= 3 && cols[0] && cols[1] && cols[2]) {
            parsed.push({
              holder_name: cols[0],
              degree: cols[1],
              institution: cols[2],
              issue_date: cols[3] || new Date().toISOString().split("T")[0],
              grade: cols[4] || "First Class",
              reg_number: cols[5] || `BC-REG-${Math.floor(100000 + Math.random() * 900000)}`,
            });
          }
        }

        if (parsed.length === 0) {
          setBulkErrorMsg("Could not parse valid certificate records from CSV. Check column order.");
        } else {
          setBulkRecords(parsed);
        }
      } catch (err: any) {
        setBulkErrorMsg("Error reading CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessBulkIssuance = async () => {
    if (bulkRecords.length === 0 || isProcessingBulk) return;

    setIsProcessingBulk(true);
    setBulkErrorMsg(null);
    setBulkSuccessMsg(null);

    try {
      const issued: Certificate[] = [];
      for (const item of bulkRecords) {
        const res = await apiClient.issueCertificate(item);
        if (res && res.certificate) {
          issued.push(res.certificate);
        }
      }

      setBulkSuccessMsg(`Successfully issued ${issued.length} certificates in batch to the registry!`);
      setBulkRecords([]);
      fetchHistory();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("certificate_issued"));
      }
    } catch (err: any) {
      setBulkErrorMsg("Failed during batch issuance: " + err.message);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

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
        
        setIssuedHistory((prev) => {
          const map = new Map<string, Certificate>();
          [result.certificate, ...prev].forEach((item) => {
            const key = item.id || item.blockchain_hash;
            if (key && !map.has(key)) map.set(key, item);
          });
          return Array.from(map.values());
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("certificate_issued"));
        }

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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0B1220] max-w-3xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <FileSpreadsheet className="w-12 h-12 text-[#00FF87] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Batch CSV Certificate Issuance</h3>
            <p className="text-xs text-slate-400">
              Upload a CSV spreadsheet containing multiple student records to issue certificates in batch.
            </p>

            <button
              onClick={handleDownloadSampleCsv}
              className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#00FF87] border border-[#00FF87]/30 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample CSV Template</span>
            </button>
          </div>

          {bulkErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bulkErrorMsg}</span>
            </div>
          )}

          {bulkSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/30 flex items-center gap-2.5 text-[#00FF87] text-xs font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              <span>{bulkSuccessMsg}</span>
            </div>
          )}

          {/* File Upload Zone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 bg-[#070B14] text-center hover:border-[#00FF87]/40 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00FF87] file:text-[#070B14] hover:file:bg-[#00E67A] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Expected CSV columns: Holder Name, Degree, Institution, Issue Date, Grade, Reg Number
            </p>
          </div>

          {/* Parsed CSV Preview Table */}
          {bulkRecords.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#00FF87] font-bold">
                  Parsed Records Preview ({bulkRecords.length})
                </span>
                <button
                  onClick={() => setBulkRecords([])}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear List
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 font-mono">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Holder Name</th>
                      <th className="p-2.5">Degree</th>
                      <th className="p-2.5">Institution</th>
                      <th className="p-2.5">Reg Number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bulkRecords.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-white">{rec.holder_name}</td>
                        <td className="p-2.5 text-slate-300">{rec.degree}</td>
                        <td className="p-2.5 text-slate-400">{rec.institution}</td>
                        <td className="p-2.5 font-mono text-[#00E5FF]">{rec.reg_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleProcessBulkIssuance}
                disabled={isProcessingBulk}
                className="w-full py-3.5 rounded-xl bg-[#00FF87] hover:bg-[#00E67A] text-[#070B14] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessingBulk ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Batch & Generating Hashes...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Process & Issue All {bulkRecords.length} Certificates</span>
                  </>
                )}
              </button>
            </div>
          )}
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
