"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Plus,
    GripVertical,
    Pencil,
    Trash2,
    Video,
    FileText,
    CheckCircle,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    Loader2,
    File,
    Gamepad2,
    ListChecks,
    Play,
    AlertCircle,
    Download,
    Clock,
    Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

import * as UpChunk from "@mux/upchunk";
import MuxPlayer from "@mux/mux-player-react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// --- Content Item Component ---
// --- Content Item Component ---
function ContentItem({ item, onEdit, onDelete, onPlay }: { item: any, onEdit: (item: any) => void, onDelete: (id: string, category: string, type: string) => void, onPlay: (item: any) => void }) {
    const isVideo = item.type === "video";
    const isPDF = item.type === "pdf";
    const isAssignment = item.type === "assignment";
    const isQuiz = item.type === "quiz";
    const router = useRouter();

    const Icon = isVideo ? Video :
        isPDF ? FileText :
            isAssignment ? File :
                isQuiz ? ListChecks : FileText;

    const [videoError, setVideoError] = useState(false);

    return (
        <div className="group flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:border-slate-300">
            {/* Icon / Thumbnail Section */}
            <div className="shrink-0" onClick={() => isVideo && onPlay(item)}>
                {isVideo ? (
                    <div className="w-full sm:w-40 aspect-video bg-slate-100 rounded-lg overflow-hidden relative group/video border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity">
                        {item.muxPlaybackId ? (
                            <img
                                src={`https://image.mux.com/${item.muxPlaybackId}/thumbnail.png?width=400&height=225&fit_mode=preserve`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <Video className="w-8 h-8 text-white/50" />
                            </div>
                        )}

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/video:bg-black/20 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-slate-900 ml-0.5" fill="currentColor" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        isPDF ? "bg-red-50 text-red-500" :
                            isAssignment ? "bg-primary/10 text-primary" :
                                "bg-green-50 text-green-500"
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-slate-900 text-base mb-1">{item.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-bold bg-slate-100 text-slate-500">
                                {item.type}
                            </Badge>

                            {isVideo && item.duration && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {item.duration}
                                </span>
                            )}

                            {isQuiz && (
                                <span>{item.questions?.length || 0} Questions</span>
                            )}

                            {isAssignment && (
                                <Badge variant={item.status === 'Active' ? 'default' : 'secondary'} className={cn(
                                    "text-[10px]",
                                    item.status === 'Active' ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
                                )}>
                                    {item.status || "Draft"}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(isAssignment || isQuiz) && (
                            <Button
                                onClick={() => router.push(`/admin/assignments/${item.type}/${item._id}/edit`)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10"
                                title="Edit Questions/Details"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        )}
                        {isPDF && item.url && (
                            <Button
                                onClick={() => window.open(item.url, '_blank')}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10"
                                title="Download / View"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        )}

                        <Button onClick={(e) => { e.stopPropagation(); onEdit(item); }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5" title="Edit">
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); onDelete(item._id, item.category, item.type); }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- Sortable Module Item Component ---
function SortableModule({
    module,
    materials,
    assignments,
    onEdit,
    onDelete,
    onAddContent,
    onEditContent,
    onDeleteContent,
    onPlayContent,
}: {
    module: any;
    materials: any[];
    assignments: any[];
    onEdit: (m: any) => void;
    onDelete: (id: Id<"modules">) => void;
    onAddContent: (moduleId: Id<"modules">, type: string) => void;
    onEditContent: (item: any) => void;
    onDeleteContent: (id: string, category: string, type: string) => void;
    onPlayContent: (item: any) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: module._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isExpanded, setIsExpanded] = useState(true);

    // Combine and sort content, tagged with category
    const content = [
        ...materials.map(m => ({ ...m, category: 'courseMaterials' })),
        ...assignments.map(a => ({ ...a, category: 'assignments' }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="p-4 flex items-center gap-4 bg-slate-50/50 rounded-t-xl border-b border-slate-100">
                <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1">
                    <GripVertical className="w-5 h-5" />
                </div>

                <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-slate-700 p-1">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>

                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{module.title}</h3>
                    {module.description && <p className="text-sm text-slate-500 line-clamp-1">{module.description}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant={module.isPublished ? "default" : "secondary"} className={cn(module.isPublished ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-600")}>
                        {module.isPublished ? "Published" : "Draft"}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(module)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit Module
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(module._id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 bg-white rounded-b-xl space-y-4">
                    {content.length > 0 ? (
                        <div className="space-y-2">
                            {content.map((item) => (
                                <ContentItem
                                    key={item._id}
                                    item={item}
                                    onEdit={onEditContent}
                                    onDelete={onDeleteContent}
                                    onPlay={onPlayContent}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-sm">
                            No content in this module yet.
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full border-dashed border-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-primary hover:border-primary/20 h-12 rounded-xl transition-all">
                                <Plus className="w-4 h-4 mr-2" /> Add Content
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                            <DropdownMenuLabel>Add Resource</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onAddContent(module._id, "video")}>
                                <Video className="w-4 h-4 mr-2" /> Upload Video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddContent(module._id, "pdf")}>
                                <FileText className="w-4 h-4 mr-2" /> Upload PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Add Assessment</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onAddContent(module._id, "assignment")}>
                                <File className="w-4 h-4 mr-2" /> Create Assignment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddContent(module._id, "quiz")}>
                                <ListChecks className="w-4 h-4 mr-2" /> Create Quiz
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}



export default function CourseContentPage() {
    const params = useParams();
    const router = useRouter();
    // Correctly resolve params first (if using Next.js 15+ wait but for now assuming standard)
    const courseId = params.id as Id<"courses">;

    const course = useQuery(api.courses.getById, { id: courseId });
    const modules = useQuery(api.modules.getModules, { courseId });
    const materials = useQuery(api.materials.listByCourse, { courseId });
    const assignments = useQuery(api.assignments.listByCourse, { courseId });

    // Mutations
    const createModule = useMutation(api.modules.create);
    const updateModule = useMutation(api.modules.update);
    const deleteModule = useMutation(api.modules.requestDelete);
    const reorderModules = useMutation(api.modules.updateOrder);
    const addMaterial = useMutation(api.materials.addMaterial);
    const updateMaterial = useMutation(api.materials.updateMaterial);
    const deleteMaterial = useMutation(api.materials.deleteMaterial);
    const createAssignment = useMutation(api.assignments.createAssignment);
    const updateAssignment = useMutation(api.assignments.update);
    const deleteAssignment = useMutation(api.assignments.deleteAssignment);

    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showAssignmentPrompt, setShowAssignmentPrompt] = useState(false);
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const [editingModule, setEditingModule] = useState<any>(null);
    const [moduleTitle, setModuleTitle] = useState("");
    const [moduleDesc, setModuleDesc] = useState("");

    const searchParams = useSearchParams(); // Needs import

    useEffect(() => {
        if (searchParams.get("prompt") === "create_quiz") {
            setShowQuizPrompt(true);
            // Optional: clean URL
            // router.replace(pathname);
        }
    }, [searchParams]);

    // Add/Edit Content State
    const [addContentModalOpen, setAddContentModalOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<Id<"modules"> | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<any | null>(null); // For editing content

    const [contentTitle, setContentTitle] = useState("");
    // const [contentDuration, setContentDuration] = useState(""); // Removed manual duration
    const [contentUrl, setContentUrl] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [notesFile, setNotesFile] = useState<File | null>(null);

    // Delete Confirmation State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, category: string, type: string } | null>(null);

    // Video Player State
    const [playVideoUrl, setPlayVideoUrl] = useState<string | null>(null);
    const [playVideoModuleId, setPlayVideoModuleId] = useState<string | null>(null);
    const [videoError, setVideoError] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const generateUploadUrl = useMutation(api.materials.generateUploadUrl);
    const generateMuxUploadUrl = useAction(api.mux.getUploadUrl);
    const getMuxMetadata = useAction(api.mux.getMuxMetadata);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [playingVideo, setPlayingVideo] = useState<any | null>(null);

    // Mux Upload Logic
    const uploadToMux = async (file: File, onProgress?: (percent: number) => void) => {
        try {
            // 1. Get Upload URL from Mux (via Convex Action)
            const { uploadUrl, uploadId } = await generateMuxUploadUrl({});

            if (!uploadUrl) throw new Error("Failed to get Mux upload URL");

            // 2. Start Chunked Upload
            return new Promise<string>((resolve, reject) => {
                const upload = UpChunk.createUpload({
                    endpoint: uploadUrl,
                    file: file,
                    chunkSize: 30720, // 30MB chunks for faster upload
                    dynamicChunkSize: true,
                });

                upload.on("progress", (progress) => {
                    if (onProgress) onProgress(Math.floor(progress.detail));
                });

                upload.on("success", () => {
                    console.log("Mux Upload Success, ID:", uploadId);
                    resolve(uploadId);
                });

                upload.on("error", (err) => {
                    console.error("--- Mux Upload Error Debug Start ---");
                    console.error("Broad Error Object:", err);
                    console.dir(err);

                    // Check for standard Error properties
                    if (err instanceof Error) {
                        console.error("Error Name:", err.name);
                        console.error("Error Message:", err.message);
                        console.error("Error Stack:", err.stack);
                    }

                    // Check for UpChunk specific detail
                    if ((err as any).detail) {
                        console.error("Error Detail:", (err as any).detail);
                    }

                    console.error("--- Mux Upload Error Debug End ---");

                    const errorMessage = (err as any).detail?.message || (err instanceof Error ? err.message : "Unknown upload error");
                    reject(new Error("Upload failed: " + errorMessage));
                });
            });
        } catch (error) {
            console.error("Mux Upload Failed:", error);
            throw error;
        }
    };

    const uploadFile = async (file: File, onProgress?: (percent: number) => void) => {
        // If it's a video, use Mux
        if (file.type.startsWith("video/")) {
            console.log("Starting Mux upload for:", file.name);
            return await uploadToMux(file, onProgress);
        }

        console.log("Starting Standard upload for:", file.name, "Size:", file.size);

        // Step 1: Get Upload URL
        let postUrl;
        try {
            console.log("Requesting upload URL...");
            postUrl = await generateUploadUrl();
            console.log("Upload URL received:", postUrl);
        } catch (error) {
            console.error("Upload URL generation failed:", error);
            throw new Error("Detailed Error: Failed to generate upload URL.");
        }

        if (!postUrl) {
            throw new Error("Detailed Error: No upload URL received from server.");
        }

        // Step 2: Upload File (XHR for progress)
        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", postUrl, true);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    if (onProgress) onProgress(percent);
                }
            };

            xhr.onload = async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const json = JSON.parse(xhr.responseText);
                        if (!json || !json.storageId) {
                            console.error("Invalid JSON response (no storageId):", json);
                            reject(new Error("Detailed Error: Server returned no storageId."));
                            return;
                        }
                        console.log("Upload successful, received storageId:", json.storageId);
                        resolve(json.storageId);
                    } catch (e) {
                        console.error("JSON Parse error:", e);
                        console.error("Raw response:", xhr.responseText);
                        reject(new Error("Detailed Error: Invalid JSON response from upload server."));
                    }
                } else {
                    console.error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
                    reject(new Error(`Detailed Error: Upload rejected with status ${xhr.status}`));
                }
            };

            xhr.onerror = (e) => {
                console.error("XHR Network Error", e);
                console.error("Failed to upload to URL:", postUrl);
                reject(new Error("Detailed Error: XHR Network Failure during upload. Check console for URL."));
            };

            xhr.send(file);
        });
    };

    const handleCreateModule = async () => {
        if (!contentTitle) return; // User is entering "Title" for the video lesson

        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
            // Validate files
            const validFiles = [videoFile, notesFile].filter(f => f !== null) as File[];
            const totalSize = validFiles.reduce((acc, f) => acc + f.size, 0) || 1; // Avoid divide by zero
            let loadedSizes = new Array(validFiles.length).fill(0);

            const updateAggregatedProgress = () => {
                const totalLoaded = loadedSizes.reduce((acc, loaded) => acc + loaded, 0);
                const percent = Math.min(100, Math.round((totalLoaded / totalSize) * 100));
                setUploadProgress(percent);
            };

            // 1. Upload files in parallel
            const uploadPromises = [];
            let videoStorageId: string | undefined = undefined;
            let notesStorageId: string | undefined = undefined;

            if (videoFile) {
                const index = uploadPromises.length;
                uploadPromises.push(
                    uploadFile(videoFile, (percent) => {
                        loadedSizes[index] = (percent / 100) * videoFile.size;
                        updateAggregatedProgress();
                    }).then(id => videoStorageId = id)
                );
            }

            if (notesFile) {
                const index = uploadPromises.length;
                uploadPromises.push(
                    uploadFile(notesFile, (percent) => {
                        loadedSizes[index] = (percent / 100) * notesFile.size;
                        updateAggregatedProgress();
                    }).then(id => notesStorageId = id)
                );
            }

            await Promise.all(uploadPromises);

            let videoMetadata = null;
            if (videoFile && videoStorageId) {
                try {
                    // Fetch Mux metadata (Playback ID, Asset ID, Duration)
                    // Poll for a short time or just try once? Mux is fast but might need a second.
                    // For simplicity, we try once. In production, polling might be safer or use webhooks.
                    // Let's add a small delay to ensure Mux has registered the upload transition
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    videoMetadata = await getMuxMetadata({ uploadId: videoStorageId });
                } catch (e) {
                    console.error("Failed to fetch Mux metadata", e);
                }
            }

            // 2. Create the module (container) for this lesson
            const moduleId = await createModule({
                courseId,
                title: contentTitle, // Use video title as module title
                description: "", // Optional or could use a description field if added
                isPublished: false,
            });

            if (moduleId) {
                // 3. Add materials
                await addMaterial({
                    courseId,
                    moduleId: moduleId,
                    title: contentTitle,
                    type: "video",
                    fileId: videoStorageId,
                    duration: videoMetadata?.duration ? formatDuration(videoMetadata.duration) : undefined,
                    status: "Active",
                    muxAssetId: videoMetadata?.assetId,
                    muxPlaybackId: videoMetadata?.playbackId,
                });

                // 4. Add notes if they accept it
                if (notesFile && notesStorageId) {
                    await addMaterial({
                        courseId,
                        moduleId: moduleId,
                        title: `${contentTitle} (Notes)`,
                        type: "pdf",
                        fileId: notesStorageId,
                        status: "Active",
                    });
                }
            }

            // Reset
            setContentTitle("");
            setContentTitle("");
            // setContentDuration("");
            setVideoFile(null);
            setNotesFile(null);

            setIsCreateModalOpen(false);
        } catch (error: any) {
            console.error("Failed to create module/upload", error);
            setUploadError(error.message || "Failed to create lesson.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateModule = async () => {
        if (!editingModule || !moduleTitle) return;
        await updateModule({
            moduleId: editingModule._id,
            title: moduleTitle,
            description: moduleDesc,
        });
        setEditingModule(null);
        setModuleTitle("");
        setModuleDesc("");
    };

    const handleAddContent = async () => {
        if (!contentTitle) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {

            // EDIT MODE
            if (editingContent) {
                if (['video', 'pdf'].includes(editingContent.type)) {
                    await updateMaterial({
                        id: editingContent._id,
                        title: contentTitle,
                        url: contentUrl || undefined,
                    });
                } else if (['assignment', 'quiz'].includes(editingContent.type)) {
                    await updateAssignment({
                        id: editingContent._id,
                        title: contentTitle,
                        courseId,
                        type: editingContent.type,
                        dueDate: editingContent.dueDate,
                        status: editingContent.status,
                        moduleId: selectedModuleId || undefined,
                    });
                }
                setAddContentModalOpen(false);
                setEditingContent(null);
                resetContentForm();
                return;
            }

            // ADD MODE
            if (!selectedModuleId && (contentType === 'video' || contentType === 'pdf')) {
                // Should be prevented by UI but just in case
                return;
            }

            if (contentType === "video") {
                // Parallel upload for video + optional notes
                const uploadPromises = [];
                let videoStorageId: string | undefined = undefined;
                let notesStorageId: string | undefined = undefined;

                const validFiles = [videoFile, notesFile].filter(f => f !== null) as File[];
                const totalSize = validFiles.reduce((acc, f) => acc + f.size, 0) || 1;
                let loadedSizes = new Array(validFiles.length).fill(0);

                const updateAggregatedProgress = () => {
                    const totalLoaded = loadedSizes.reduce((acc, loaded) => acc + loaded, 0);
                    const percent = Math.min(100, Math.round((totalLoaded / totalSize) * 100));
                    setUploadProgress(percent);
                };

                if (videoFile) {
                    const index = uploadPromises.length;
                    uploadPromises.push(
                        uploadFile(videoFile, (percent) => {
                            loadedSizes[index] = (percent / 100) * videoFile.size;
                            updateAggregatedProgress();
                        }).then(id => videoStorageId = id)
                    );
                }

                if (notesFile) {
                    const index = uploadPromises.length;
                    uploadPromises.push(
                        uploadFile(notesFile, (percent) => {
                            loadedSizes[index] = (percent / 100) * notesFile.size;
                            updateAggregatedProgress();
                        }).then(id => notesStorageId = id)
                    );
                }

                await Promise.all(uploadPromises);

                let videoMetadata = null;
                if (videoFile && videoStorageId) {
                    try {
                        // Poll for Mux metadata (up to 10 times, 1s interval)
                        // Mux assets take a few seconds to be ready after upload
                        for (let i = 0; i < 10; i++) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            videoMetadata = await getMuxMetadata({ uploadId: videoStorageId });
                            if (videoMetadata) break; // Found it!
                        }
                    } catch (e) {
                        console.error("Failed to fetch Mux metadata", e);
                    }
                }

                await addMaterial({
                    courseId,
                    moduleId: selectedModuleId || undefined,
                    title: contentTitle,
                    type: "video",
                    fileId: videoStorageId,
                    url: !videoStorageId ? contentUrl : undefined, // specific url fallback
                    duration: videoMetadata?.duration ? formatDuration(videoMetadata.duration) : undefined,
                    status: "Active",
                    muxAssetId: videoMetadata?.assetId,
                    muxPlaybackId: videoMetadata?.playbackId,
                });

                if (notesFile && notesStorageId) { // Verify notes uploaded
                    await addMaterial({
                        courseId,
                        moduleId: selectedModuleId || undefined,
                        title: `${contentTitle} (Notes)`,
                        type: "pdf",
                        fileId: notesStorageId,
                        status: "Active",
                    });
                }

                // Prompt for assignment creation
                setAddContentModalOpen(false);
                resetContentForm(); // Reset form first
                setShowAssignmentPrompt(true); // Then show prompt
                return; // Exit early to avoid closing prompt by setAddContentModalOpen(false) if it was later (though we closed it above)

            } else if (contentType === "pdf") {
                let pdfStorageId = undefined;
                if (pdfFile) {
                    // Single file upload, direct progress mapping
                    pdfStorageId = await uploadFile(pdfFile, (percent) => setUploadProgress(percent));
                }

                await addMaterial({
                    courseId,
                    moduleId: selectedModuleId || undefined,
                    title: contentTitle,
                    type: "pdf",
                    fileId: pdfStorageId,
                    url: !pdfStorageId ? contentUrl : undefined,
                    status: "Active",
                });
            } else if (contentType === "assignment" || contentType === "quiz") {
                const newAssignmentId = await createAssignment({
                    courseId,
                    moduleId: selectedModuleId || undefined,
                    title: contentTitle,
                    type: contentType,
                    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
                    status: "Active",
                });

                if (newAssignmentId) {
                    router.push(`/admin/assignments/${contentType}/${newAssignmentId}/edit`);
                    return;
                }
            }

            setAddContentModalOpen(false);
            resetContentForm();
        } catch (error: any) {
            console.error("Failed to add content", error);
            setUploadError(error.message || "Failed to upload content.");
        } finally {
            setIsUploading(false);
        }
    };

    const resetContentForm = () => {
        setContentTitle("");
        // setContentDuration("");
        setContentUrl("");
        setVideoFile(null);
        setPdfFile(null);
        setNotesFile(null);
        setEditingContent(null);
    };

    const handleEditContent = (item: any) => {
        setEditingContent(item);
        setContentType(item.type);
        setContentTitle(item.title);
        // setContentDuration(item.duration || "");
        setContentUrl(item.url || "");

        // Pre-select module if available, otherwise "uncategorized" (null)
        setSelectedModuleId(item.moduleId || null);

        setAddContentModalOpen(true);
    };

    const handleDeleteClick = (id: string, category: string, type: string) => {
        setItemToDelete({ id, category, type });
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        // Check category to determine correct mutation
        if (itemToDelete.category === 'assignments') {
            await deleteAssignment({ id: itemToDelete.id as Id<"assignments"> });
        } else {
            // Default to courseMaterials
            await deleteMaterial({ id: itemToDelete.id as Id<"courseMaterials"> });
        }

        setDeleteConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && modules) {
            const oldIndex = modules.findIndex((m) => m._id === active.id);
            const newIndex = modules.findIndex((m) => m._id === over.id);

            const newModules = arrayMove(modules, oldIndex, newIndex);

            reorderModules({
                updates: newModules.map((m, index) => ({
                    id: m._id,
                    order: index + 1,
                })),
            });
        }
    };

    const handlePlayContent = (url: string, moduleId: string) => {
        setPlayVideoUrl(url);
        setPlayVideoModuleId(moduleId);
        setVideoError(false);
    };

    // Helper to open add content
    const openAddContent = (id: Id<"modules">, type: string) => {
        setSelectedModuleId(id);
        setContentType(type);
        setAddContentModalOpen(true);
        resetContentForm();
    }

    if (!course) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-20 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/admin/courses" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-2 block">
                        &larr; Back to Courses
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Course Content: <span className="text-primary">{course.title}</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage modules, lessons, and assignments.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-6"
                >
                    <Plus className="w-5 h-5" /> Add Video Lesson
                </Button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Module List (Full Width) */}
                <div className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Course Modules</h2>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            {modules?.length || 0} Sections
                        </Badge>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={modules?.map(m => m._id) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {modules?.length === 0 && (
                                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <ListChecks className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No content yet</h3>
                                        <p className="text-slate-500 mb-6">Start by adding your first video lesson.</p>
                                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-white hover:bg-primary/90">Add Video Lesson</Button>
                                    </div>
                                )}
                                {modules?.map((module) => (
                                    <SortableModule
                                        key={module._id}
                                        module={module}
                                        materials={materials?.filter(m => m.moduleId === module._id) || []}
                                        assignments={assignments?.filter(a => a.moduleId === module._id) || []}
                                        onEdit={(m) => {
                                            setEditingModule(m);
                                            setModuleTitle(m.title);
                                            setModuleDesc(m.description || "");
                                        }}
                                        onDelete={(moduleId) => deleteModule({ moduleId })}
                                        onAddContent={openAddContent}
                                        onEditContent={handleEditContent}
                                        onDeleteContent={handleDeleteClick}
                                        onPlayContent={(item) => setPlayingVideo(item)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* --- Mini Player Modal --- */}
                    <Dialog open={!!playingVideo} onOpenChange={(open) => !open && setPlayingVideo(null)}>
                        <DialogContent className="sm:max-w-[800px] p-0 bg-black overflow-hidden border-slate-800">
                            <DialogHeader className="sr-only">
                                <DialogTitle>Video Player</DialogTitle>
                            </DialogHeader>
                            <div className="relative w-full aspect-video bg-black">
                                {playingVideo && (
                                    playingVideo.muxPlaybackId ? (
                                        <MuxPlayer
                                            playbackId={playingVideo.muxPlaybackId}
                                            metadata={{ video_title: playingVideo.title }}
                                            streamType="on-demand"
                                            className="w-full h-full"
                                            autoPlay
                                            accentColor="#EA580C" // Orange accent
                                        />
                                    ) : (
                                        <ReactPlayer
                                            url={playingVideo.url}
                                            width="100%"
                                            height="100%"
                                            controls
                                            playing={true}
                                        />
                                    )
                                )}
                            </div>
                            {playingVideo && (
                                <div className="p-4 bg-slate-900 text-white">
                                    <h3 className="font-semibold text-lg">{playingVideo.title}</h3>
                                    {playingVideo.duration && <p className="text-slate-400 text-sm flex items-center gap-2"><Clock className="w-3 h-3" /> {playingVideo.duration}</p>}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Orphaned Content Section */}
                    {(() => {
                        const orphanedMaterials = materials?.filter(m => !m.moduleId) || [];
                        const orphanedAssignments = assignments?.filter(a => !a.moduleId) || [];

                        if (orphanedMaterials.length > 0 || orphanedAssignments.length > 0) {
                            const orphans = [
                                ...orphanedMaterials.map(m => ({ ...m, category: 'courseMaterials' })),
                                ...orphanedAssignments.map(a => ({ ...a, category: 'assignments' }))
                            ];

                            return (
                                <div className="mt-8 pt-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-orange-900">Uncategorized Content</h3>
                                                <p className="text-sm text-orange-700">Items not assigned to any section.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {orphans.map((item) => (
                                                <div key={item._id} className="flex items-center justify-between p-3 bg-white border border-orange-100/50 rounded-lg group shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${item.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                                            {item.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[150px]">{item.title}</h4>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{item.type}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleDeleteClick(item._id, item.category, item.type)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 grid place-items-center"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>

            {/* Create Module / Add Video Dialog */}
            <Dialog open={isCreateModalOpen || !!editingModule} onOpenChange={(open: boolean) => {
                if (!open) {
                    setIsCreateModalOpen(false);
                    setEditingModule(null);
                    setModuleTitle("");
                    setModuleDesc("");
                    // Reset content fields too
                    setContentTitle("");
                    // setContentDuration("");
                    setVideoFile(null);
                    setNotesFile(null);
                }
            }}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{editingModule ? "Edit Section" : "Add Video Lesson"}</DialogTitle>
                        <DialogDescription>
                            {editingModule ? "Update section details." : "Upload a video and its resources."}
                        </DialogDescription>
                    </DialogHeader>

                    {editingModule ? (
                        // Edit Mode (Legacy Module Edit)
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="text-sm font-bold text-slate-700">Section Name</label>
                                <Input
                                    id="name"
                                    value={moduleTitle}
                                    onChange={(e) => setModuleTitle(e.target.value)}
                                    placeholder="e.g. Introduction"
                                    className="h-12 bg-slate-50 border-none rounded-xl"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="desc" className="text-sm font-bold text-slate-700">Description (Optional)</label>
                                <Textarea
                                    id="desc"
                                    value={moduleDesc}
                                    onChange={(e) => setModuleDesc(e.target.value)}
                                    placeholder="Briefly describe this section..."
                                    className="min-h-[100px] bg-slate-50 border-none rounded-xl resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        // Create Mode (Add Video)
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="c-title" className="text-sm font-bold text-slate-700">Title</label>
                                <Input
                                    id="c-title"
                                    value={contentTitle}
                                    onChange={(e) => setContentTitle(e.target.value)}
                                    placeholder="e.g. Introduction to Design"
                                    className="h-12 bg-slate-50 border-none rounded-xl"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="c-video-folder" className="text-sm font-bold text-slate-700">Video from our folder</label>
                                <Input
                                    id="c-video-folder"
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                    className="h-12 bg-slate-50 border-none rounded-xl pt-2 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-lg file:mr-4 file:border-0"
                                />
                            </div>
                            {/* Duration Field Removed */}
                            <div className="grid gap-2">
                                <label htmlFor="c-notes" className="text-sm font-bold text-slate-700">Attach PDF notes</label>
                                <Input
                                    id="c-notes"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setNotesFile(e.target.files?.[0] || null)}
                                    className="h-12 bg-slate-50 border-none rounded-xl pt-2 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-lg file:mr-4 file:border-0"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {uploadError && (
                            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="font-medium">{uploadError}</p>
                            </div>
                        )}
                        <Button onClick={() => {
                            if (editingModule) handleUpdateModule();
                            else handleCreateModule();
                        }} disabled={editingModule ? !moduleTitle : !contentTitle || isUploading} className="w-full h-12 rounded-xl font-bold relative overflow-hidden">
                            {isUploading && (
                                <div
                                    className="absolute inset-0 bg-primary/20 transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {uploadProgress}% Uploading...
                                    </>
                                ) : (
                                    editingModule ? "Save Changes" : "Add Video"
                                )}
                            </span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Content Dialog (Keep existing for adding extra content to modules) */}
            <Dialog open={addContentModalOpen} onOpenChange={setAddContentModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black capitalize">{editingContent ? "Edit" : "Add"} {contentType}</DialogTitle>
                        <DialogDescription>
                            {editingContent ? `Update this ${contentType} details.` : `Add a new ${contentType} to this module.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="c-title" className="text-sm font-bold text-slate-700">Name</label>
                            <Input
                                id="c-title"
                                value={contentTitle}
                                onChange={(e) => setContentTitle(e.target.value)}
                                placeholder={`e.g. ${contentType === 'video' ? 'Intro Video' : 'Pop Quiz 1'}`}
                                className="h-12 bg-slate-50 border-none rounded-xl"
                            />
                        </div>

                        {(contentType === 'assignment' || contentType === 'quiz') && (
                            <div className="grid gap-2">
                                <label htmlFor="c-module" className="text-sm font-bold text-slate-700">Section</label>
                                <Select
                                    value={selectedModuleId || "uncategorized"}
                                    onValueChange={(value) => setSelectedModuleId(value === "uncategorized" ? null : value as Id<"modules">)}
                                >
                                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl">
                                        <SelectValue placeholder="Select a section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                        {modules?.map((m) => (
                                            <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {contentType === 'video' && (
                            <>
                                <div className="grid gap-2">
                                    <label htmlFor="c-url" className="text-sm font-bold text-slate-700">URL (Optional)</label>
                                    <Input
                                        id="c-url"
                                        value={contentUrl}
                                        onChange={(e) => setContentUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="h-12 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                {/* Duration Field Removed */}
                                <div className="grid gap-2">
                                    <label htmlFor="c-video" className="text-sm font-bold text-slate-700">Video from our folder</label>
                                    <Input
                                        id="c-video"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        className="h-12 bg-slate-50 border-none rounded-xl pt-2 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-lg file:mr-4 file:border-0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="c-notes" className="text-sm font-bold text-slate-700">Attach PDF notes</label>
                                    <Input
                                        id="c-notes"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setNotesFile(e.target.files?.[0] || null)}
                                        className="h-12 bg-slate-50 border-none rounded-xl pt-2 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-lg file:mr-4 file:border-0"
                                    />
                                </div>
                            </>
                        )}

                        {contentType === 'pdf' && (
                            <>
                                <div className="grid gap-2">
                                    <label htmlFor="c-url" className="text-sm font-bold text-slate-700">URL (Optional)</label>
                                    <Input
                                        id="c-url"
                                        value={contentUrl}
                                        onChange={(e) => setContentUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="h-12 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="c-pdf" className="text-sm font-bold text-slate-700">PDF File</label>
                                    <Input
                                        id="c-pdf"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                        className="h-12 bg-slate-50 border-none rounded-xl pt-2 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-lg file:mr-4 file:border-0"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddContent} disabled={!contentTitle || isUploading} className="w-full h-12 rounded-xl font-bold">
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                                </>
                            ) : (
                                editingContent ? "Save Changes" : "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this {itemToDelete?.type} and remove it from the course.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
