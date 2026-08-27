"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage for valid JWT session token
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("blockcertify_jwt") || localStorage.getItem("blockcertify_token")
        : null;

    if (!token && pathname !== "/login") {
      setIsAuthenticated(false);
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF87]" />
        <span className="text-xs font-mono">Verifying Authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF87]" />
        <span className="text-xs font-mono">Redirecting to Sign In...</span>
      </div>
    );
  }

  return <>{children}</>;
}
