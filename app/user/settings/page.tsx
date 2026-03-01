"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Camera, ChevronRight, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SettingsPage() {
    const user = useQuery(api.users.currentUser);
    const updateProfile = useMutation(api.users.updateProfile);
    const generateUploadUrl = useMutation(api.users.generateUploadUrl);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setBio(user.bio || "");
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateProfile({
                name: name,
                bio: bio,
            });
            toast.success("Profile Updated", {
                description: "Your personal details have been saved successfully.",
            });
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Error", {
                description: "Failed to update profile. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (user === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-muted-foreground mb-4">Please log in to manage your settings.</p>
            </div>
        );
    }

    // Split name into First and Last for the UI (mocking it since we only store full name)
    const splitName = name.split(" ");
    const firstName = splitName[0] || "";
    const lastName = splitName.slice(1).join(" ") || "";

    const handleNameChange = (first: string, last: string) => {
        setName(`${first} ${last}`.trim());
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Get upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.statusText}`);
            }

            const { storageId } = await result.json();

            // 3. Update profile with storageId
            await updateProfile({
                imageStorageId: storageId,
            });

            toast.success("Photo Updated", {
                description: "Your profile picture has been updated successfully.",
            });
        } catch (error) {
            console.error("Failed to update photo", error);
            toast.error("Upload Failed", {
                description: "Failed to upload profile photo. Please try again.",
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleChangePassword = () => {
        toast.info("Change Password", {
            description: "Please contact your administrator or use your login provider to change your password.",
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-inter">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handlePhotoChange}
            />
            {/* Breadcrumb & Title */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Link href="/user/dashboard" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground">Profile & Settings</span>
                </div>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Profile & Settings</h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage your account information and security preferences.</p>
                </div>
            </div>

            {/* Personal Details Card */}
            <Card className="border-border shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-bold text-foreground">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {/* Photo Section */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm">
                                <AvatarImage src={user.imageUrl} alt={name || "User"} />
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                                    {(name || user.email || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full border-4 border-white shadow-sm">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-foreground">{name || "User Name"}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">JPG, GIF or PNG. Max size of 800K</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-bold text-xs h-9 px-4 gap-2"
                                onClick={handlePhotoClick}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-3 h-3" />
                                        Update Photo
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="font-bold">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => handleNameChange(e.target.value, lastName)}
                                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="font-bold">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => handleNameChange(firstName, e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email" className="font-bold">Email Address</Label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="h-12 rounded-xl bg-slate-50 border-transparent font-medium text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio" className="font-bold">Short Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us a little about yourself..."
                                className="min-h-[120px] rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all font-medium resize-none p-4"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 px-8 gap-2 transition-all active:scale-95"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Password Management Card */}
            <Card className="border-border shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-bold text-foreground">Password Management</CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground mt-1">
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Password</h4>
                                <p className="text-xs font-medium text-muted-foreground">Last changed 3 months ago</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl font-bold h-10 px-6 border-slate-200"
                            onClick={handleChangePassword}
                        >
                            Change Password
                        </Button>
                    </div>
                    {/* Note: Actual password change logic would integrate with Clerk */}
                </CardContent>
            </Card>
        </div>
    );
}
