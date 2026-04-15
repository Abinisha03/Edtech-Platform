"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCourses() {
    const courses = useQuery(api.courses.listPublished);
    const enrollments = useQuery(api.enrollments.getMyEnrollments);

    if (courses === undefined) {
        return (
            <section className="py-16 md:py-24 bg-background">
                <div className="container px-4 md:px-8">
                    <div className="space-y-4 mb-12">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-24 bg-background">
            <div className="container px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            A broad selection of courses
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-[600px]">
                            Choose from our latest online video courses with new additions published every month
                        </p>
                    </div>
                    {/* Categories removed as per user request */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {courses.map((course: any) => {
                        const isEnrolled = enrollments?.some(e => String(e.courseId) === String(course._id));

                        return (
                            <Link href={isEnrolled ? "/user/dashboard" : `/user/courses/${course._id}`} key={course._id}>
                                <Card className="group h-full overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {course.thumbnail ? (
                                            <Image
                                                src={course.thumbnail}
                                                alt={course.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform duration-500">
                                                <span className="font-medium">No Thumbnail</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                        <Badge className="absolute top-3 left-3 bg-white/90 text-black backdrop-blur-sm hover:bg-white border-none font-bold px-3 py-1 shadow-sm">
                                            {course.category || "Course"}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4 flex-1">
                                        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        {course.instructorName && (
                                            <p className="text-sm text-muted-foreground mb-3">{course.instructorName}</p>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">New</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between mt-auto">
                                        {isEnrolled ? (
                                            <div className="w-full">
                                                <span className="inline-block w-full text-center text-sm font-bold text-emerald-600 bg-emerald-50 py-2 rounded-md transition-colors group-hover:bg-emerald-100">
                                                    Go to Course
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-lg font-bold text-primary">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(course.price)}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Enroll Now</span>
                                            </>
                                        )}
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                    {courses.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            <p>No courses published yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
