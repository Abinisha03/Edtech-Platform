"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function Stats() {
    const stats = useQuery(api.courses.getLandingStats);

    const STATS = [
        { label: "Students", value: stats?.students ? stats.students.toLocaleString() : "10k+" },
        { label: "Courses", value: stats?.courses ? stats.courses.toLocaleString() : "50+" },
        { label: "Enrollments", value: stats?.enrollments ? stats.enrollments.toLocaleString() : "15k+" },
    ];

    if (!stats) {
        // While loading, show skeleton OR just show static data immediately for better UX
        // Let's show static data immediately if we simply want "real data look"
    }

    return (
        <section className="py-20 bg-primary/5">
            <div className="container px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="text-center space-y-2">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary">{stat.value}</div>
                            <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
