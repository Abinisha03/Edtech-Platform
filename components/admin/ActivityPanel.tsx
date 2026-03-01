"use client";

import { Clock, UserPlus, BookCopy, UploadCloud } from "lucide-react";

interface Activity {
    _id: string;
    type: "user_registration" | "course_created" | "content_upload" | string;
    description: string;
    timestamp: number;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case "user_registration": return UserPlus;
        case "course_created": return BookCopy;
        case "content_upload": return UploadCloud;
        default: return Clock;
    }
};

const getActivityColor = (type: string) => {
    switch (type) {
        case "user_registration": return "text-blue-600 bg-blue-50";
        case "course_created": return "text-emerald-600 bg-emerald-50";
        case "content_upload": return "text-purple-600 bg-purple-50";
        default: return "text-slate-600 bg-slate-50";
    }
};

export function ActivityPanel({ activities }: { activities: any[] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Recent System Activity</h3>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">View All</button>
            </div>

            <div className="divide-y divide-slate-100">
                {activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-400 text-sm italic">No recent activity found</p>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type);
                        const colorClass = getActivityColor(activity.type);

                        return (
                            <div key={activity._id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                <div className={`p-2.5 rounded-lg shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{activity.description}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-xs font-semibold text-slate-900 px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Details</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
