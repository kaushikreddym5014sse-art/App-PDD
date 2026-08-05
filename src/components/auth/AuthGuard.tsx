"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage for JWT session token
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("blockcertify_jwt") || localStorage.getItem("blockcertify_token")
        : null;

    if (!token) {
      setIsAuthenticated(false);
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF87]" />
        <span className="text-xs font-mono">Verifying Session Authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-rose-400">
        <ShieldAlert className="w-10 h-10" />
        <span className="text-sm font-semibold">Access Denied. Please sign in to continue.</span>
      </div>
    );
  }

  return <>{children}</>;
}
