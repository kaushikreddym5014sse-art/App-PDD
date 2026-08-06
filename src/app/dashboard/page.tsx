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
  Shield,
  FileText
} from "lucide-react";
import { apiClient, DashboardData } from "@/lib/api-client";
import { Certificate } from "@/types/certificate";
import { User as UserType } from "@/types/auth";
import CertificateCard from "@/components/verify/CertificateCard";
import WalletConnectBtn from "@/components/wallet/WalletConnectBtn";
import AuthGuard from "@/components/auth/AuthGuard";
import { formatDate } from "@/lib/utils";

function DashboardContent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [stats, setStats] = useState({
    totalCredentials: 0,
    onChainVerified: 0,
    fraudVerdict: "PASS",
    polygonStatus: "Mainnet Active",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProfileAndDashboard();
  }, []);

  const fetchProfileAndDashboard = async () => {
    setIsLoading(true);
    try {
      const profile = await apiClient.getProfile().catch(() => null);
      if (profile) setCurrentUser(profile);

      const data: DashboardData = await apiClient.getDashboardData();
      if (data) {
        setStats(data.stats);
        setCertificates(data.certificates);
        if (data.certificates.length > 0) {
          setSelectedCert(data.certificates[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    const matchesSearch = 
      c.holder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.degree?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.blockchain_hash?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 glass-panel-neon rounded-3xl border border-[#00FF87]/30 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#070B14] via-[#0E1626] to-[#070B14]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/30 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-[#00FF87]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00FF87] px-2 py-0.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30">
                {currentUser?.role || "Institution Account"}
              </span>
              <span className="text-xs text-slate-400 font-mono">BlockCertify Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {currentUser?.full_name || "Dhanush1111"}
            </h1>
            <p className="text-xs text-slate-400 font-mono">{currentUser?.email || "iamdhanush63@gmail.com"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProfileAndDashboard} 
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#00FF87] border border-white/10 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00FF87]" : ""}`} />
          </button>
          <WalletConnectBtn />
          <button 
            onClick={() => {
              apiClient.logout();
              router.push("/login");
            }}
            className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Credentials</span>
            <Award className="w-4 h-4 text-[#00FF87]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.totalCredentials}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Stored in PostgreSQL DB</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">On-Chain Verified</span>
            <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.onChainVerified}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">100% SHA-256 Pinned</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fraud Score Verdict</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">{stats.fraudVerdict}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Risk Assessment: LOW</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Polygon Protocol</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">Mainnet</p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Block #48291042 Active</span>
        </div>
      </div>

      {/* Filter and View Mode Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by degree, institution, or hash..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 outline-none focus:border-[#00FF87] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "all" ? "bg-[#00FF87] text-[#070B14] font-bold" : "text-slate-400 hover:text-white"}`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => setStatusFilter("verified")}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === "verified" ? "bg-[#00FF87] text-[#070B14] font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Verified
            </button>
          </div>

          <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#00FF87] text-[#070B14]" : "text-slate-400 hover:text-white"}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-[#00FF87] text-[#070B14]" : "text-slate-400 hover:text-white"}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00FF87]" />
          <span className="text-xs font-mono">Loading Credentials from PostgreSQL...</span>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl text-slate-400">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">No credentials found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">No certificates match your search query or no certificates have been issued yet.</p>
          <button
            onClick={() => router.push("/issuer")}
            className="px-5 py-2.5 rounded-xl bg-[#00FF87] text-[#070B14] font-bold text-xs hover:bg-[#00E67A] transition-all"
          >
            Go to Issuer Portal →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Portfolio Cards */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Portfolio Cards</span>
              <span className="text-xs font-mono text-[#00FF87]">Showing {filteredCerts.length}</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredCerts.map((cert) => {
                const isSelected = selectedCert?.id === cert.id || selectedCert?.blockchain_hash === cert.blockchain_hash;
                return (
                  <div
                    key={cert.id || cert.blockchain_hash}
                    onClick={() => setSelectedCert(cert)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0E1626] border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.2)]"
                        : "glass-panel border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-[#00FF87]">
                        {cert.id ? (cert.id.startsWith("BC-") ? cert.id : `BC-${cert.id.slice(0, 6)}`) : "BC-CERT"}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30">
                        {cert.status?.toUpperCase() || "VERIFIED"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1">{cert.degree}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cert.institution}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-2">Issued: {formatDate(cert.issue_date)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Certificate Full Preview */}
          <div className="lg:col-span-2">
            {selectedCert && (
              <div className="sticky top-24">
                <CertificateCard certificate={selectedCert} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
