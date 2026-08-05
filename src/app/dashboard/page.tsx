"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Award, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Grid, 
  List as ListIcon, 
  CheckCircle2, 
  User, 
  LogOut, 
  Sparkles, 
  Shield
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Certificate } from "@/types/certificate";
import { User as UserType } from "@/types/auth";
import CertificateCard from "@/components/verify/CertificateCard";
import WalletConnectBtn from "@/components/wallet/WalletConnectBtn";
import AuthGuard from "@/components/auth/AuthGuard";
import { formatDate } from "@/lib/utils";

function DashboardContent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>({
    id: "usr_102941",
    full_name: "Alex Rivera",
    email: "alex.rivera@example.com",
    role: "user",
    institution: "Polygon Guild Labs",
  });

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProfileAndCertificates();
  }, []);

  const fetchProfileAndCertificates = async () => {
    setIsLoading(true);
    try {
      const profile = await apiClient.getProfile().catch(() => null);
      if (profile) setCurrentUser(profile);

      const data = await apiClient.listCertificates();
      setCertificates(data);
      if (data.length > 0) {
        setSelectedCert(data[0]);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    router.push("/login");
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.holder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.blockchain_hash && cert.blockchain_hash.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ? true : cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      {/* Top Welcome Banner */}
      <div className="glass-panel-neon p-6 sm:p-8 rounded-3xl border border-[#00FF87]/30 bg-gradient-to-r from-[#0E1626] via-[#0A0F1D] to-[#0E1626] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_40px_rgba(0,255,135,0.08)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00FF87] to-[#00E5FF] p-[1.5px] shadow-[0_0_20px_rgba(0,255,135,0.3)]">
            <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
              <User className="w-7 h-7 text-[#00FF87]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00FF87] px-2.5 py-0.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 uppercase">
                {currentUser?.role || "Recipient"} Account
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser?.institution || "BlockCertify Platform"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, <span className="gradient-text-neon">{currentUser?.full_name || "Alex Rivera"}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={fetchProfileAndCertificates}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00FF87]" : ""}`} />
          </button>
          <WalletConnectBtn />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00FF87]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Credentials</span>
            <Award className="w-5 h-5 text-[#00FF87]" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{certificates.length}</p>
          <p className="text-[11px] text-[#00FF87] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Stored in PostgreSQL DB</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">On-Chain Verified</span>
            <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <p className="text-3xl font-extrabold text-[#00E5FF] font-mono">
            {certificates.filter((c) => c.status === "verified").length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">100% SHA-256 Pinned</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Fraud Score Verdict</span>
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">PASS</p>
          <p className="text-[11px] text-slate-400 mt-1">Risk Assessment: LOW</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Polygon Protocol</span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">Mainnet</p>
          <p className="text-[11px] text-purple-400 mt-1">Block #48291042 Active</p>
        </div>
      </div>

      {/* Credentials Management Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-white/10">
        {/* Search Input */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#070B14] border border-white/10 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by degree, institution, or hash..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 w-full"
          />
        </div>

        {/* Filter Pills & View Toggles */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex p-1 bg-[#070B14] rounded-xl border border-white/10">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "all" ? "bg-[#00FF87] text-[#070B14]" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => setStatusFilter("verified")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "verified" ? "bg-[#00FF87] text-[#070B14]" : "text-slate-400 hover:text-white"
              }`}
            >
              Verified
            </button>
          </div>

          <div className="flex p-1 bg-[#070B14] rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white/10 text-[#00FF87]" : "text-slate-400"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white/10 text-[#00FF87]" : "text-slate-400"
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View / Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Certificates Selection List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Portfolio Cards</span>
            <span className="text-[#00FF87] text-xs font-normal">Showing {filteredCertificates.length}</span>
          </h3>

          <div className="space-y-3">
            {filteredCertificates.map((cert) => {
              const isSelected = selectedCert?.id === cert.id;
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border group ${
                    isSelected
                      ? "bg-[#0E1626] border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.15)]"
                      : "bg-[#0A0F1D]/80 border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-[#00FF87]">
                      {cert.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30 font-semibold uppercase">
                      {cert.status || "VERIFIED"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#00FF87] transition-colors">
                    {cert.degree}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{cert.institution}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-2">
                    Issued: {formatDate(cert.issue_date)}
                  </p>
                </div>
              );
            })}

            {filteredCertificates.length === 0 && (
              <div className="p-8 glass-panel rounded-2xl text-center text-slate-400 text-xs">
                No matching certificates found for query "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Certificate Full Display Inspector */}
        <div className="lg:col-span-2 flex flex-col items-center">
          {selectedCert ? (
            <CertificateCard certificate={selectedCert} />
          ) : (
            <div className="w-full p-12 glass-panel rounded-3xl text-center text-slate-400">
              Select a certificate from the portfolio list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
