"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Bell,
    Lock,
    Clock,
    UserPlus,
    FileText,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Info,
    ChevronDown,
    Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Custom Switch Component for High-Fidelity feel
const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
        onClick={onChange}
        className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            checked ? "bg-primary" : "bg-muted"
        )}
    >
        <span
            className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-card transition-transform duration-200 ease-in-out shadow-sm",
                checked ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

// Custom Checkbox Component for High-Fidelity feel
const Checkbox = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
    <div
        onClick={onChange}
        className={cn(
            "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group",
            checked ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-transparent hover:border-border"
        )}
    >
        <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
            checked ? "bg-primary border-primary" : "bg-card border-muted-foreground/30 group-hover:border-primary/50"
        )}>
            {checked && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
        </div>
        <span className={cn(
            "text-sm font-bold transition-colors",
            checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
        )}>
            {label}
        </span>
    </div>
);

export default function SystemSettingsPage() {
    const [tfa, setTfa] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [complexity, setComplexity] = useState({
        length: true,
        special: true,
        mixed: true,
        forceChange: false
    });

    const [notifications, setNotifications] = useState({
        registrations: true,
        submissions: false,
        maintenance: true
    });

    const [isSavingSecurity, setIsSavingSecurity] = useState(false);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);

    const handleSaveSecurity = () => {
        setIsSavingSecurity(true);
        setTimeout(() => setIsSavingSecurity(false), 800);
    };

    const handleSaveNotifications = () => {
        setIsSavingNotifications(true);
        setTimeout(() => setIsSavingNotifications(false), 800);
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-inter">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">System Settings</span>
            </div>

            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-4xl font-black text-foreground tracking-tight">System Settings</h1>
                <p className="text-muted-foreground font-medium text-lg">Configure platform-wide security protocols and automated notifications.</p>
            </div>

            {/* Security Settings Section */}
            <Card className="border-border shadow-sm rounded-[2.5rem] overflow-hidden bg-card">
                <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Shield className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl font-black text-foreground tracking-tight">Security Settings</CardTitle>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
                        Secure
                    </Badge>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between group">
                        <div className="space-y-1.5">
                            <h4 className="font-extrabold text-foreground tracking-tight">Two-Factor Authentication (2FA)</h4>
                            <p className="text-sm font-medium text-muted-foreground max-w-xl leading-relaxed">
                                Enforce 2FA for all administrator and teacher roles for enhanced account security.
                            </p>
                        </div>
                        <Switch checked={tfa} onChange={() => setTfa(!tfa)} />
                    </div>

                    <div className="h-[1px] bg-border" />

                    {/* Session Timeout */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <h4 className="font-extrabold text-foreground tracking-tight">Session Timeout Duration</h4>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                Set how long an admin session remains active before automatic logout.
                            </p>
                        </div>
                        <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                            <SelectTrigger className="h-12 w-[240px] rounded-2xl border-border bg-muted/50 font-bold text-foreground">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border shadow-xl font-semibold">
                                <SelectItem value="15">15 Minutes</SelectItem>
                                <SelectItem value="30">30 Minutes</SelectItem>
                                <SelectItem value="60">1 Hour</SelectItem>
                                <SelectItem value="120">2 Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-[1px] bg-border" />

                    {/* Password Complexity */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <h4 className="font-extrabold text-foreground tracking-tight">Password Complexity Requirements</h4>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                Define rules for new user password generation.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Checkbox
                                checked={complexity.length}
                                onChange={() => setComplexity(prev => ({ ...prev, length: !prev.length }))}
                                label="At least 12 characters long"
                            />
                            <Checkbox
                                checked={complexity.special}
                                onChange={() => setComplexity(prev => ({ ...prev, special: !prev.special }))}
                                label="Include special characters (@, #, !)"
                            />
                            <Checkbox
                                checked={complexity.mixed}
                                onChange={() => setComplexity(prev => ({ ...prev, mixed: !prev.mixed }))}
                                label="Mixed case (Upper & Lower)"
                            />
                            <Checkbox
                                checked={complexity.forceChange}
                                onChange={() => setComplexity(prev => ({ ...prev, forceChange: !prev.forceChange }))}
                                label="Force change every 90 days"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSaveSecurity}
                            disabled={isSavingSecurity}
                            className="h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/20 px-10 gap-2 transition-all active:scale-95"
                        >
                            {isSavingSecurity ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <ShieldCheck className="w-5 h-5" />
                            )}
                            Save Security Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings Section */}
            <Card className="border-border shadow-sm rounded-[2.5rem] overflow-hidden bg-card">
                <CardHeader className="p-10 pb-6 flex flex-row items-center gap-4 border-b border-border">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Bell className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-black text-foreground tracking-tight">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                    {/* Info Alert */}
                    <div className="flex gap-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 text-primary">
                        <Info className="w-6 h-6 shrink-0 mt-0.5" />
                        <p className="text-sm font-bold leading-relaxed">
                            These notifications apply globally to all administrator accounts. Individual notification settings can be overridden in profile settings.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* New Course Registrations */}
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border border-transparent hover:border-border transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-card text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-foreground tracking-tight">New Course Registrations</h4>
                                    <p className="text-xs font-bold text-muted-foreground">Email notification for every new student signup</p>
                                </div>
                            </div>
                            <Switch checked={notifications.registrations} onChange={() => setNotifications(prev => ({ ...prev, registrations: !prev.registrations }))} />
                        </div>

                        {/* Assignment Submissions */}
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border border-transparent hover:border-border transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-card text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-foreground tracking-tight">Assignment Submissions</h4>
                                    <p className="text-xs font-bold text-muted-foreground">Daily summary of all pending assignments</p>
                                </div>
                            </div>
                            <Switch checked={notifications.submissions} onChange={() => setNotifications(prev => ({ ...prev, submissions: !prev.submissions }))} />
                        </div>

                        {/* System Maintenance Alerts */}
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border border-transparent hover:border-border transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-card text-muted-foreground group-hover:text-destructive transition-colors shadow-sm">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-foreground tracking-tight">System Maintenance Alerts</h4>
                                    <p className="text-xs font-bold text-muted-foreground">Critical alerts for downtime and system updates</p>
                                </div>
                            </div>
                            <Switch checked={notifications.maintenance} onChange={() => setNotifications(prev => ({ ...prev, maintenance: !prev.maintenance }))} />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSaveNotifications}
                            disabled={isSavingNotifications}
                            className="h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/20 px-10 gap-2 transition-all active:scale-95"
                        >
                            {isSavingNotifications ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Bell className="w-5 h-5" />
                            )}
                            Save Notification Rules
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Status */}
            <div className="flex justify-center text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-4">
                Last updated by Rivera (Admin) on Oct 24, 2023 at 09:45 AM
            </div>
        </div>
    );
}
