"use node";

import { action } from "./_generated/server";
import Mux from "@mux/mux-node";

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

const mux = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET,
});

export const cleanupMuxAssets = action({
    args: {},
    handler: async () => {
        if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
            throw new Error("Mux API keys are missing.");
        }

        console.log("Listing Mux assets...");
        const assets = await mux.video.assets.list();
        const allAssets = assets.data;

        console.log(`Found ${allAssets.length} assets.`);

        // Sort by creation time (descending: newest first)
        const sortedAssets = allAssets.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const KEEP_COUNT = 5;
        if (sortedAssets.length <= KEEP_COUNT) {
            console.log("Assets within limit. No cleanup needed.");
            return { deletedCount: 0, keptCount: sortedAssets.length };
        }

        const assetsToDelete = sortedAssets.slice(KEEP_COUNT);
        console.log(`Deleting ${assetsToDelete.length} old assets...`);

        let deletedCount = 0;
        for (const asset of assetsToDelete) {
            try {
                if (asset.id) {
                    await mux.video.assets.delete(asset.id);
                    console.log(`Deleted asset: ${asset.id}`);
                    deletedCount++;
                }
            } catch (error) {
                console.error(`Failed to delete asset ${asset.id}:`, error);
            }
        }

        return { deletedCount, keptCount: KEEP_COUNT };
    },
});
