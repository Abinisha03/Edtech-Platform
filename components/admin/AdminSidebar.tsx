"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    BarChart3,
    Settings,
    GraduationCap,
    Download,
    X,
    ChevronRight
} from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "User Management", icon: Users, href: "/admin/users" },
    { label: "Course Management", icon: BookOpen, href: "/admin/courses" },

    { label: "Assignment & Quizzes", icon: BarChart3, href: "/admin/assignments" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
];

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transition-all duration-300 flex flex-col overflow-y-auto",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            <div className="p-6 pb-2 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-none">Unified EdTech</h1>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Administrator Panel</p>
                    </div>
                </Link>
                <Button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <nav className="mt-8 px-4 flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 space-y-4">
                {/* User Section */}
                <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3 border border-border">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold uppercase">
                            {user?.firstName?.charAt(0) || "A"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user?.fullName || "Alex Johnson"}</p>
                        <p className="text-[10px] font-medium text-muted-foreground truncate">System Admin</p>
                    </div>
                </div>

                <Button className="w-full h-12  hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98] gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                </Button>
            </div>
        </aside>
    );
}

