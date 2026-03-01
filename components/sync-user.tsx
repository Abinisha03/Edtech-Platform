"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function SyncUser() {
    const { user, isLoaded } = useUser();
    const { isAuthenticated } = useConvexAuth();
    const storeUser = useMutation(api.users.store);
    const currentUser = useQuery(api.users.currentUser);
    const router = useRouter();
    const pathname = usePathname();

    // Redirection logic removed to allow admins to view landing page


    // Initial sync and redirection
    useEffect(() => {
        if (isLoaded && user && isAuthenticated) {
            const sync = async () => {
                await storeUser({
                    email: user.emailAddresses[0]?.emailAddress ?? "",
                    name: user.fullName ?? undefined,
                    imageUrl: user.imageUrl ?? undefined,
                });

            };
            sync();
        }
    }, [isLoaded, user, storeUser, isAuthenticated, router, pathname]);

    return null;
}

