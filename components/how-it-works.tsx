"use client";

import { Search, CreditCard, PlayCircle, Award } from "lucide-react";

const steps = [
    {
        icon: Search,
        title: "Browse Courses",
        description: "Explore our wide range of expert-led courses in development, design, business, and more."
    },
    {
        icon: CreditCard,
        title: "Purchase & Enroll",
        description: "Get secure, lifetime access to course content with a simple one-time payment."
    },
    {
        icon: PlayCircle,
        title: "Learn at Your Pace",
        description: "Watch high-quality video lessons, read notes, and complete assignments on your own schedule."
    },
    {
        icon: Award,
        title: "Get Certified",
        description: "Complete the course requirements and earn a certificate to showcase your new skills."
    }
];

export function HowItWorks() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-lg text-muted-foreground">
                        Start your learning journey in 4 simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                <step.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
