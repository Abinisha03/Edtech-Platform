"use client";

import { Button } from "@/components/ui/button";
import { MoveRight, PlayCircle } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background pt-16 pb-20 lg:pt-24 lg:pb-32">
            <div className="container px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                            New courses just added!
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:leading-[1.1]">
                            Master New Skills with{" "}
                            <span className="text-primary italic">Expert-Led</span> Online
                            Courses
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                            Explore thousands of high-quality courses in development, design,
                            business, and more. Start your journey today with world-class instructors.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20"
                                onClick={() => {
                                    const element = document.getElementById('courses');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                Explore Courses <MoveRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-lg font-semibold"
                                onClick={() => {
                                    const element = document.getElementById('how-it-works');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                How it works <PlayCircle className="ml-2 h-5 w-5 text-primary" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-10 w-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px]"
                                    >
                                        U{i}
                                    </div>
                                ))}
                                <div className="h-10 w-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                                    +10k
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Join <span className="text-foreground font-bold">10,000+</span> happy students
                            </p>
                        </div>
                    </div>
                    <div className="relative animate-in fade-in slide-in-from-right duration-1000">
                        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/20 to-secondary overflow-hidden border shadow-2xl relative">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
                                alt="Students collaborating"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Floating Info Cards */}
                        <div className="absolute top-10 -left-6 bg-background p-4 rounded-xl shadow-xl border animate-bounce duration-[3000ms]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Certified</p>
                                    <p className="text-sm font-bold">Industry Expert</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 -right-6 bg-background p-4 rounded-xl shadow-xl border animate-bounce duration-[4000ms] delay-500">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Flexible</p>
                                    <p className="text-sm font-bold">Lifetime Access</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
