"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    href: string;
    trend?: {
        value: string;
        positive: boolean;
    };
}

export function MetricCard({ title, value, description, icon: Icon, href, trend }: MetricCardProps) {
    return (
        <Link
            href={href}
            className="group block p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-slate-300 transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900 leading-none">{value}</h3>
                </div>
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
                <p className="text-sm text-slate-600">{description}</p>
                {trend && (
                    <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {trend.value}
                    </span>
                )}
            </div>
        </Link>
    );
}
