"use client";

import { UserNavbar } from "@/components/user-navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, BarChart3, Users } from "lucide-react";

export default function BusinessPage() {
    return (
        <div className="min-h-screen bg-[#fcfdff] antialiased pt-20">
            <UserNavbar />

            <div className="max-w-[1400px] mx-auto pt-12 px-12 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                            <Building2 className="w-3 h-3" />
                            For Enterprise
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                            Upskill Your <br /><span className="text-indigo-600">Entire Workforce</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            The most effective way to train your team in modern technologies. Curated learning paths, analytics, and dedicated support.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                "Customizable Learning Paths",
                                "Team Progress Analytics",
                                "SSO & Advanced Security",
                                "Dedicated Success Manager"
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0" />
                                    <span className="text-lg font-bold text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 text-lg">
                                Schedule Demo
                            </Button>
                            <Button variant="outline" className="h-14 px-10 border-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-black rounded-2xl text-lg">
                                View Pricing
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-10 space-y-8">
                            <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900">Team Performance</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <BarChart3 className="w-4 h-4" /> Last 30 Days
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: "Engineering Team", progress: 78, color: "bg-indigo-500" },
                                    { label: "Product Design", progress: 64, color: "bg-pink-500" },
                                    { label: "Data Science", progress: 92, color: "bg-emerald-500" }
                                ].map(team => (
                                    <div key={team.label} className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-slate-700">{team.label}</span>
                                            <span className="text-slate-900">{team.progress}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${team.color} rounded-full`} style={{ width: `${team.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 flex items-center gap-4">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200" />
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-slate-500">
                                    <span className="text-slate-900">+120</span> Active Learners
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
