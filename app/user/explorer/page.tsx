"use client";

import { UserNavbar } from "@/components/user-navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturedCourses } from "@/components/featured-courses";
import { Stats } from "@/components/stats";
import { Footer } from "@/components/footer";

export default function StudentExplorerPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <UserNavbar />
            <main className="flex-1 pt-20">
                <Hero />
                <div id="how-it-works">
                    <HowItWorks />
                </div>
                <div id="courses">
                    <FeaturedCourses />
                </div>
                <Stats />
            </main>
            <Footer />
        </div>
    );
}
