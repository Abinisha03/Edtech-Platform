"use client";

import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturedCourses } from "@/components/featured-courses";
import { Stats } from "@/components/stats";
import { Footer } from "@/components/footer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function Page() {
    const { isLoaded, userId } = useAuth();
    const user = useQuery(api.users.currentUser);
    const enrollments = useQuery(api.enrollments.getMyEnrollments);
    const router = useRouter();

    // Students and Admins stay on the landing page





    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
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