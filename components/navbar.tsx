"use client";

import Link from "next/link";
import { Search, Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";

import { usePathname } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Hide global navbar on dashboard pages
    const isAdminPage = pathname.startsWith("/admin");
    const isStudentDashboard = pathname.startsWith("/user") &&
        !pathname.includes("/user/courses/") &&
        !pathname.includes("/user/enroll");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isAdminPage || isStudentDashboard) return null;

    // Prevent hydration mismatch by returning null or a simplified version during SSR
    if (!mounted) {
        return (
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-8">
                    <div className="flex items-center gap-6 lg:gap-10">
                        <Link href="/" className="flex items-center space-x-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <span className="inline-block font-bold text-xl text-primary tracking-tight">
                                EduFlow
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-8">
                <div className="flex items-center gap-6 lg:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="inline-block font-bold text-xl text-primary tracking-tight">
                            EduFlow
                        </span>
                    </Link>
                </div>

                <div className="flex-1 max-w-xl hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search for anything..."
                            className="w-full pl-10 rounded-full bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2">
                        <SignedOut>
                            <SignInButton mode="modal" forceRedirectUrl="/user/explorer">
                                <Button variant="ghost" className="hidden sm:inline-flex">
                                    Log in
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal" forceRedirectUrl="/user/explorer">
                                <Button className="bg-primary text-primary-foreground rounded-full font-medium text-sm sm:text-base h-10 px-4 sm:px-5 cursor-pointer hover:bg-primary/90 transition-colors">
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            {/* Admin Shortcut */}
                            <AdminLink />
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>

                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}

function AdminLink() {
    const user = useQuery(api.users.currentUser);
    if (user?.role !== "admin") return null;

    return (
        <Link href="/admin/dashboard">
            <Button variant="outline" className="hidden sm:inline-flex border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                Admin Dashboard
            </Button>
        </Link>
    );

}
