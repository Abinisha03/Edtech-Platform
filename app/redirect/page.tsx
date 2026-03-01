"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RedirectPage() {
    const { isLoaded, userId, orgRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        router.replace("/");
    }, [router]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
            <div className="text-center">
                <h1 className="text-xl font-bold text-slate-900">Redirecting...</h1>
                <p className="text-slate-500 mt-1">Checking your organization role and permissions.</p>
            </div>
        </div>
    );
}
