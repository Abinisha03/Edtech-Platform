"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentNavbar } from "@/components/student/StudentNavbar";
import { useState, useEffect } from "react";
import { Loader2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isLoaded } = useAuth();
    const enrollments = useQuery(api.enrollments.getMyEnrollments);
    const hasEnrollments = enrollments && enrollments.length > 0;

    // The sidebar should NOT show on the explorer/landing page or during enrollment OR internally in the course learning page
    // Also hide on Course Detail page to focus on enrollment
    const isHideSidebarPage = pathname === '/user/explorer' ||
        pathname.includes('/user/enroll') ||
        pathname.includes('/learn') ||
        pathname.startsWith('/user/courses/');

    const showSidebar = isLoaded && !isHideSidebarPage;

    return (
        <div className="min-h-screen bg-[#f8fafc] antialiased flex">
            {showSidebar && (
                <StudentSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            )}

            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300",
                showSidebar ? "md:ml-64" : "ml-0"
            )}>
                {showSidebar && (
                    <StudentNavbar setIsOpen={setIsSidebarOpen} />
                )}

                <main className={cn(
                    "flex-1",
                    showSidebar ? "p-4 md:p-8 lg:p-12 mt-20" : "p-0 mt-0"
                )}>
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
