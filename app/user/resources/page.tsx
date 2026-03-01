"use client";

import { UserNavbar } from "@/components/user-navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Video, Users, MessageSquare, Download, ArrowRight, Book } from "lucide-react";

export default function ResourcesPage() {
    const resources = [
        {
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-50",
            title: "Documentation & Guides",
            description: "Comprehensive technical documentation and step-by-step guides for all coursework.",
            count: "150+ Articles"
        },
        {
            icon: Video,
            color: "text-purple-500",
            bg: "bg-purple-50",
            title: "Webinar Library",
            description: "Access recorded sessions from industry experts, career coaches, and alumni.",
            count: "50+ Hours"
        },
        {
            icon: Users,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            title: "Community Forum",
            description: "Connect with peers, ask questions, and share your projects in our active community.",
            count: "5k+ Members"
        },
        {
            icon: Download,
            color: "text-amber-500",
            bg: "bg-amber-50",
            title: "Project Templates",
            description: "Downloadable starter code, design assets, and cheat sheets to speed up your workflow.",
            count: "200+ Assets"
        }
    ];

    return (
        <div className="min-h-screen bg-[#fcfdff] antialiased pt-20">
            <UserNavbar />

            <div className="max-w-[1400px] mx-auto pt-12 px-12 space-y-16 pb-20">
                <div className="text-center max-w-2xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
                        Student <span className="text-primary">Resources</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Everything you need to succeed in your learning journey, curated by our team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {resources.map((resource, i) => (
                        <Card key={i} className="p-8 rounded-[2.5rem] border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg group cursor-pointer">
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 ${resource.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                                    <resource.icon className={`w-8 h-8 ${resource.color}`} />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{resource.title}</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed">{resource.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{resource.count}</span>
                                        <Button variant="ghost" className="h-10 px-4 rounded-xl text-primary font-bold hover:bg-primary/5">
                                            Access Now <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl font-black text-white tracking-tight">Need 1-on-1 Mentorship?</h2>
                        <p className="text-slate-400 text-lg font-medium">
                            Book a session with a senior developer to review your code, discuss career paths, or get unstuck.
                        </p>
                        <Button className="h-14 px-8 bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl text-lg">
                            Find a Mentor
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
