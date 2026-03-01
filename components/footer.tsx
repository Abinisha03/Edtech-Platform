"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
            <div className="container px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-1 space-y-4">
                        <Link href="/" className="inline-block font-bold text-2xl text-white tracking-tight">
                            EduFlow
                        </Link>
                        <p className="text-sm text-slate-400">
                            Leading the way in online education. Learn from industry experts and advance your career today.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold">EduFlow Business</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Teach on EduFlow</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Get the app</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">About us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contact us</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Help and Support</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Affiliate</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-white font-bold">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cookie settings</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Sitemap</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white flex items-center gap-2">
                            <Globe className="h-4 w-4" /> English
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-800">
                    <p className="text-xs text-slate-500">© 2024 EduFlow, Inc.</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-slate-500 hover:text-white"><Facebook className="h-5 w-5" /></Link>
                        <Link href="#" className="text-slate-500 hover:text-white"><Twitter className="h-5 w-5" /></Link>
                        <Link href="#" className="text-slate-500 hover:text-white"><Instagram className="h-5 w-5" /></Link>
                        <Link href="#" className="text-slate-500 hover:text-white"><Youtube className="h-5 w-5" /></Link>
                        <Link href="#" className="text-slate-500 hover:text-white"><Linkedin className="h-5 w-5" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
