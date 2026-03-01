"use node";

import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import Mux from "@mux/mux-node";

// Verify environment variables are set
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

const mux = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET,
});

if (MUX_TOKEN_ID) {
    console.log("Using Mux Token ID:", MUX_TOKEN_ID.substring(0, 4) + "****");
}
if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
    console.error("Mux API keys missing in environment.");
}

export const getUploadUrl = action({
    args: {},
    handler: async () => {
        if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
            console.error("Mux API keys missing in getUploadUrl");
            throw new Error("Mux API keys are missing in Convex dashboard.");
        }

        console.log("Attempting to create Mux upload URL...");
        try {
            // Create direct upload URL
            const upload = await mux.video.uploads.create({
                new_asset_settings: {
                    playback_policy: ["public"],
                },
                cors_origin: "*", // Adjust for production security later
            });

            console.log("Mux upload URL created successfully:", upload.url);
            return {
                uploadUrl: upload.url,
                uploadId: upload.id,
            };
        } catch (error) {
            console.error("Failed to create Mux upload URL:", error);
            // @ts-ignore
            throw new Error(error.message || "Failed to create Mux upload URL");
        }
    },
});

export const getMuxMetadata = action({
    args: { uploadId: v.string() },
    handler: async (ctx, args) => {
        if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
            throw new Error("Mux API keys are missing.");
        }

        try {
            const upload = await mux.video.uploads.retrieve(args.uploadId);
            if (!upload.asset_id) {
                return null; // Asset not ready yet
            }

            const asset = await mux.video.assets.retrieve(upload.asset_id);
            const playbackId = asset.playback_ids?.[0]?.id;

            return {
                playbackId,
                assetId: upload.asset_id,
                duration: asset.duration,
            };
        } catch (error) {
            console.error("Failed to fetch Mux metadata:", error);
            // Don't throw, just return null so we can retry or handle gracefully
            return null;
        }
    },
});


