"use client";

import { useUser } from "@clerk/nextjs";
import { Bell, Search, Menu, Home, ChevronRight, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavbarProps {
    setIsOpen: (open: boolean) => void;
}

export function AdminNavbar({ setIsOpen }: AdminNavbarProps) {
    const { user } = useUser();

    return (
        <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-card border-b border-border z-40 flex items-center justify-between px-4 md:px-10">
            <div className="flex items-center gap-8 flex-1">
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Breadcrumbs */}
                <div className="hidden md:flex items-center gap-3 text-sm font-medium">
                    <h2 className="text-xl font-bold text-foreground mr-4">Admin System Dashboard</h2>
                    <div className="h-4 w-[1px] bg-border mx-2" />
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">System Analytics</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative max-w-xs transition-all duration-300 focus-within:max-w-md hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search analytics..."
                        className="w-[280px] pl-12 pr-4 py-2.5 bg-muted border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all outline-none text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="relative p-2.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive border-2 border-background rounded-full"></span>
                    </button>

                    <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                        <RotateCw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}

// Helper component for LInk if not imported
import Link from "next/link";

