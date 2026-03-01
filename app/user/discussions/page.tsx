"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send,
    Bot,
    User,
    Sparkles,
    MoreVertical,
    Trash2,
    Info,
    Hash,
    MessageSquare,
    Search,
    ChevronDown,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Message = {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
};

// Mock initial messages
// Initial message generator
const getInitialMessages = (): Message[] => [
    {
        id: "1",
        role: "ai",
        content: "Hello! I'm your EduAI Assistant. I can help you with doubts related to your courses. What are you studying today?",
        timestamp: new Date(Date.now() - 60000 * 5)
    }
];

// Mock topics
const RECENT_TOPICS = [
    "Next.js App Router vs Pages Router",
    "Understanding React Hooks useEffect",
    "Python List Comprehensions",
    "Database Normalization Forms"
];

export default function AIForumPage() {
    const [messages, setMessages] = useState<Message[]>(getInitialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("All Courses");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const allCourses = useQuery(api.courses.listPublished);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/ai-forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    context: selectedCourse !== "All Courses" ? selectedCourse : undefined,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("AI API Error:", response.status, errorText);
                throw new Error(errorText || "Failed to fetch response");
            }

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to get AI response:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 animate-in fade-in duration-700 font-inter max-w-[1200px] mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            AI Discussion Forum
                        </h1>
                        <p className="text-sm font-medium text-slate-500">Instant AI course support</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="Search topics..."
                            className="pl-9 w-[220px] bg-white border-transparent hover:border-slate-200 focus:border-emerald-500/20 rounded-xl shadow-sm transition-all text-sm"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-dashed border-slate-300 font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50">
                                <Filter className="w-3.5 h-3.5" />
                                <span className="text-xs">{selectedCourse}</span>
                                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] rounded-xl p-1">
                            <DropdownMenuItem className="rounded-lg font-medium text-xs cursor-pointer" onClick={() => setSelectedCourse("All Courses")}>
                                All Courses
                            </DropdownMenuItem>
                            {allCourses?.map(course => (
                                <DropdownMenuItem key={course._id} className="rounded-lg font-medium text-xs cursor-pointer" onClick={() => setSelectedCourse(course.title)}>
                                    {course.title}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-4">

                {/* Chat Column */}
                <Card className="lg:col-span-8 border-none shadow-sm rounded-[24px] bg-white flex flex-col overflow-hidden relative h-full">
                    {/* Chat Area - Using native scrolling for better smoothness */}
                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                        <div className="space-y-6 max-w-3xl mx-auto py-4 min-h-full flex flex-col justify-end">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 py-20">
                                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium">No messages yet. Start the conversation!</p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {/* Avatar */}
                                    <Avatar className={cn(
                                        "w-8 h-8 shrink-0",
                                        msg.role === "ai" ? "bg-white" : "bg-slate-100"
                                    )}>
                                        {msg.role === "ai" ? (
                                            <div className="w-full h-full flex items-center justify-center bg-emerald-50 rounded-full">
                                                <Bot className="w-5 h-5 text-emerald-600" />
                                            </div>
                                        ) : (
                                            <AvatarFallback className="bg-slate-900 text-white font-black text-xs">ME</AvatarFallback>
                                        )}
                                    </Avatar>

                                    {/* Message Bubble */}
                                    <div className={cn(
                                        "flex flex-col max-w-[85%]",
                                        msg.role === "user" ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm",
                                            msg.role === "user"
                                                ? "bg-slate-900 text-white rounded-tr-sm"
                                                : "bg-slate-50 text-slate-700 rounded-tl-sm"
                                        )}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <span
                                            suppressHydrationWarning
                                            className="text-[10px] text-slate-300 font-bold mt-1 px-1"
                                        >
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3 w-full animate-in fade-in duration-300">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                                        <Bot className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="flex flex-col items-start max-w-[85%]">
                                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-50 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400/50 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-50 shrink-0 z-10">
                        <div className="max-w-3xl mx-auto">
                            <div className="relative bg-slate-50 rounded-[24px] border border-slate-200 focus-within:border-emerald-500/30 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-white transition-all duration-300 flex items-end shadow-sm">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your question..."
                                    className="w-full min-h-[54px] max-h-[150px] py-4 pl-5 pr-14 bg-transparent border-none focus:ring-0 resize-none text-sm font-medium placeholder:text-slate-400"
                                    style={{ height: "54px" }}
                                />
                                <div className="absolute right-2 bottom-2">
                                    <Button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        size="icon"
                                        className={cn(
                                            "h-10 w-10 rounded-xl transition-all shadow-none duration-300",
                                            input.trim()
                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 active:scale-95"
                                                : "bg-slate-200 text-slate-400"
                                        )}
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 px-2">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        EduAI Powered
                                    </p>
                                </div>
                                {messages.length > 1 && (
                                    <button
                                        onClick={() => setMessages(getInitialMessages())}
                                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                                    >
                                        <Trash2 className="w-3 h-3" /> Clear Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Info Panel Column */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto pr-1">
                    {/* Recent Topics - Moved up for better utility */}
                    <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden shrink-0">
                        <CardHeader className="pb-2 pt-6 px-6">
                            <CardTitle className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wide">
                                <Hash className="w-4 h-4 text-emerald-500" />
                                Recent Discussions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="space-y-1">
                                {RECENT_TOPICS.map((topic, i) => (
                                    <button
                                        key={i}
                                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all group flex items-start gap-3 border border-transparent hover:border-slate-100"
                                    >
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-emerald-400 transition-colors shrink-0" />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-2">
                                            {topic}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Forum Guidelines - cleaner look */}
                    <Card className="border-none shadow-none bg-indigo-50/40 rounded-[24px] overflow-hidden shrink-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wide">Guidelines</h3>
                            </div>
                            <ul className="space-y-2.5">
                                {["Stay on topic", "Be concise", "No personal info", "Be respectful"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-indigo-900/70">
                                        <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
