"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    BarChart3,
    GraduationCap,
    User,
    LogOut,
    X,
    MessageSquare,
    ClipboardList,
    TrendingUp,
    Settings
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard" },
    { label: "Courses", icon: BookOpen, href: "/user/courses" },
    { label: "Assignments", icon: FileText, href: "/user/assignments" },
    { label: "Quizzes", icon: ClipboardList, href: "/user/quizzes" },
    { label: "Discussions", icon: MessageSquare, href: "/user/discussions" },
    { label: "Progress Tracking", icon: TrendingUp, href: "/user/progress" },
];

interface StudentSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function StudentSidebar({ isOpen, setIsOpen }: StudentSidebarProps) {
    const pathname = usePathname();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 z-50 transition-all duration-300 flex flex-col overflow-y-auto",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            <div className="p-8 pb-4 flex items-center justify-between">
                <Link href="/user/explorer" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">EduPlatform</h1>
                        <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-widest">Student Portal</p>
                    </div>
                </Link>
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="mt-6 px-4 flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 pt-2 space-y-2 border-t border-slate-50">
                <Link
                    href="/user/settings"
                    onClick={handleLinkClick}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all",
                        pathname === "/user/settings" ? "text-primary bg-primary/5" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span>Settings</span>
                </Link>

                <div className="pt-2">
                    <SignOutButton>
                        <button className="flex items-center gap-3 w-full px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all text-left group">
                            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                            <span>Logout</span>
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </aside>
    );
}
