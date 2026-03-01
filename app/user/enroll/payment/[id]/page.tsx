"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Smartphone,
    CreditCard,
    Building2,
    Wallet,
    QrCode,
    ShieldCheck,
    Loader2,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const totalAmount = searchParams.get("price") || "1497";
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [phoneNumber, setPhoneNumber] = useState("9876543210");

    // Fetch course from Convex
    const courseId = params.id as Id<"courses">;
    const course = useQuery(api.courses.getById, { id: courseId });

    const handlePayment = async () => {
        if (!course) return;
        setIsProcessing(true);

        // Load Razorpay Script
        const res = await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

        if (!res) {
            setIsProcessing(false);
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            // Amount should be in paise
            const result = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseInt(totalAmount) * 100 }),
            });

            const data = await result.json();

            if (!data || !data.order) {
                alert("Server error or missing Razorpay keys in .env.local.");
                setIsProcessing(false);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC variable
                amount: data.order.amount,
                currency: data.order.currency,
                name: "EdTech",
                description: `Payment for Order #${String(course._id).slice(0, 8).toUpperCase()}`,
                order_id: data.order.id,
                handler: function (response: any) {
                    // Success callback
                    router.push(`/user/enroll/success/${course._id}`);
                },
                prefill: {
                    name: "Student",
                    email: "student@example.com",
                    contact: phoneNumber,
                },
                theme: {
                    color: "#3395FF",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on("payment.failed", function (response: any) {
                console.error("Payment Failed", response.error);
                alert("Payment cancel/failed: " + (response.error.description || "Unknown error"));
            });
            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Payment failed to initialize");
        } finally {
            setIsProcessing(false);
        }
    };

    const paymentOptions = [
        { id: 'upi', name: 'UPI / QR', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
        { id: 'card', name: 'Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
        { id: 'netbanking', name: 'Netbanking', icon: Building2, desc: 'All Indian Banks' },
        { id: 'wallet', name: 'Wallet', icon: Wallet, desc: 'Mobikwik, Freecharge' },
    ];

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 sm:p-12 font-inter">
            <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-700">

                {/* Left: Razorpay-like Payment Panel */}
                <div className="p-10 md:p-16 border-r border-slate-100 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#3395FF] rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-slate-900 tracking-tighter uppercase text-[10px]">Secure Gateway</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400">ORDER #{String(course._id).slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Pay</p>
                            <h2 className="text-4xl font-black text-slate-900">₹{totalAmount}</h2>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Details</Label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+91</span>
                                <Input
                                    className="h-14 pl-14 rounded-2xl bg-slate-50 border-none font-bold"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Payment Method</Label>
                            <div className="grid grid-cols-1 gap-3">
                                {paymentOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setPaymentMethod(opt.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                                            paymentMethod === opt.id
                                                ? "border-[#3395FF] bg-[#3395FF]/5 shadow-lg shadow-[#3395FF]/5"
                                                : "border-slate-50 hover:border-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            paymentMethod === opt.id ? "bg-[#3395FF] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                        )}>
                                            <opt.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm leading-none mb-1">{opt.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{opt.desc}</p>
                                        </div>
                                        {paymentMethod === opt.id && <Check className="w-4 h-4 text-[#3395FF] ml-auto mr-2" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full h-16 mt-12 rounded-2xl bg-[#3395FF] hover:bg-[#2879D1] text-white font-black text-lg transition-all shadow-xl shadow-[#3395FF]/20 active:scale-95 disabled:opacity-50"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            `Pay ₹${totalAmount}`
                        )}
                    </Button>
                </div>

                {/* Right: QR Code & Dynamic Panel */}
                <div className="bg-[#fcfdff] p-10 md:p-16 flex flex-col items-center justify-center text-center space-y-10">
                    {paymentMethod === 'upi' ? (
                        <>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-[#3395FF] to-blue-300 rounded-[2.5rem] opacity-20 group-hover:opacity-30 blur-xl transition-opacity" />
                                <div className="w-64 h-64 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center relative border border-slate-100 p-8">
                                    <QrCode className="w-full h-full text-slate-900 opacity-80" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-50 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-[10px]">U</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Scan for Instant Payment</h3>
                                <p className="text-sm text-slate-500 font-medium max-w-[240px] leading-relaxed">
                                    Use your preferred UPI app to scan and pay immediately.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                <CreditCard className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Proceed on Phone</h3>
                                <p className="text-sm text-slate-500 font-medium max-w-[240px] leading-relaxed">
                                    Check your phone for a payment request or enter details on the left.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-10 w-full border-t border-slate-100">
                        <div className="flex items-center justify-center gap-8 grayscale opacity-50">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-4" alt="UPI" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.back()}
                className="fixed top-8 left-8 text-white/40 hover:text-white flex items-center gap-2 font-bold transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
        </div >
    );
}
