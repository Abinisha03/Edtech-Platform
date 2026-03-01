"use client";

import { Monitor, Briefcase, Database, Palette, Camera, LineChart, Code2, Music } from "lucide-react";

const CATEGORIES = [
    { name: "Development", icon: Code2, color: "bg-blue-100 text-blue-600" },
    { name: "Business", icon: Briefcase, color: "bg-emerald-100 text-emerald-600" },
    { name: "IT & Software", icon: Database, color: "bg-orange-100 text-orange-600" },
    { name: "Design", icon: Palette, color: "bg-pink-100 text-pink-600" },
    { name: "Marketing", icon: LineChart, color: "bg-purple-100 text-purple-600" },
    { name: "Photography", icon: Camera, color: "bg-cyan-100 text-cyan-600" },
    { name: "Music", icon: Music, color: "bg-red-100 text-red-600" },
    { name: "Office Productivity", icon: Monitor, color: "bg-indigo-100 text-indigo-600" },
];

export function Categories() {
    return (
        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container px-4 md:px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Top Categories</h2>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                        Discover the perfect course to advance your career or explore a new hobby
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center group cursor-pointer">
                            <div className={`h-16 w-16 mb-4 rounded-full ${cat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                <cat.icon className="h-8 w-8" />
                            </div>
                            <span className="text-sm font-bold text-center group-hover:text-primary transition-colors">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
