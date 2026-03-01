"use client";

import { useState, useEffect } from "react";
import * as UpChunk from "@mux/upchunk";

interface MuxUploaderProps {
    endpoint: string | null;
    file: File | null;
    onProgress: (percent: number) => void;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export default function useMuxUpload({ endpoint, file, onProgress, onSuccess, onError }: MuxUploaderProps) {
    useEffect(() => {
        if (!file || !endpoint) return;

        const upload = UpChunk.createUpload({
            endpoint,
            file,
            chunkSize: 5120, // 5MB chunks
        });

        upload.on("progress", (progress) => {
            onProgress(Math.floor(progress.detail));
        });

        upload.on("success", () => {
            onSuccess();
        });

        upload.on("error", (err) => {
            onError(err.detail.message);
        });

        return () => {
            // Cleanup: pause upload if component unmounts?
            // UpChunk doesn't have an easy "cancel" without the instance, 
            // but for this effect, we'll leave it running or rely on parent to manage state.
            upload.pause();
        };
    }, [file, endpoint]); // Re-run if file or endpoint changes explicitly
}
