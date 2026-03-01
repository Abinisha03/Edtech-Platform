"use client";

import { useAuth } from "@clerk/nextjs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useState, useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isLoaded, orgRole } = useAuth();
    const user = useQuery(api.users.currentUser);

    // Combined role check
    const isActuallyAdmin = orgRole === "org:admin" && user?.role === "admin";
    const isWaiting = !isLoaded || user === undefined;

    useEffect(() => {
        if (!isWaiting && !isActuallyAdmin) {
            router.push("/user/dashboard");
        }
    }, [isWaiting, isActuallyAdmin, router]);

    // Show loading state while checking user
    if (isWaiting) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-muted/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">Authenticating admin access...</p>
                </div>
            </div>
        );
    }

    // Still checking?
    if (!isActuallyAdmin) {
        return null;
    }


    return (
        <div className="min-h-screen bg-muted/30 antialiased">
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <AdminNavbar setIsOpen={setIsSidebarOpen} />
            <main className={cn(
                "min-h-screen transition-all duration-300 pt-20",
                "md:pl-64"
            )}>
                <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
