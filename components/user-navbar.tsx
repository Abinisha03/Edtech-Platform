"use client";

import Link from "next/link";
import { Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const UserNavbar = () => {
    const pathname = usePathname();

    const navItems = [
        { label: "Courses", href: "/user/explorer" },
        { label: "Programs", href: "/user/programs" },
        { label: "Resources", href: "/user/resources" },
        { label: "For Business", href: "/user/business" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-8">
                <div className="flex items-center gap-6 lg:gap-10">
                    <Link href="/user/explorer" className="flex items-center space-x-2">
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
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </nav>
    );
};
