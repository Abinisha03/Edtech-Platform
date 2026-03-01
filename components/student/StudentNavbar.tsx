"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentNavbarProps {
    setIsOpen: (open: boolean) => void;
}

export function StudentNavbar({ setIsOpen }: StudentNavbarProps) {
    const { user } = useUser();

    return (
        <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-white border-b border-slate-100 z-40 flex items-center justify-between px-6 md:px-10">
            <div className="flex items-center gap-6 flex-1">
                <button
                    onClick={() => setIsOpen(true)}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <h2 className="text-[20px] font-black text-slate-900 whitespace-nowrap hidden sm:block tracking-tight">
                    Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Student"}
                </h2>

                <div className="relative max-w-sm w-full ml-12 hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-bold transition-all outline-none text-slate-600 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/5"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                    <Link href="/user/settings">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform">
                            <AvatarImage src={user?.imageUrl} />
                            <AvatarFallback className="bg-primary text-white font-black uppercase text-xs">
                                {user?.firstName?.charAt(0) || "S"}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>
        </header>
    );
}
