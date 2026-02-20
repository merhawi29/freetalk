"use client";

import React, { useState, useMemo } from "react";

interface Participant {
    socketId: string;
    userId: string;
    username: string;
    isInCall?: boolean;
    mood?: string;
}

interface ParticipantsSidebarProps {
    participants: Participant[];
    currentUserId: string;
    typingUsers?: string[]; // Array of userIds currently typing
    onInviteChat: (targetUserId: string) => void;
    onInviteVideo: (targetUserId: string) => void;
}

export default function ParticipantsSidebar({
    participants,
    currentUserId,
    typingUsers = [],
    onInviteChat,
    onInviteVideo,
}: ParticipantsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter and Group Participants
    const { available, inCall } = useMemo(() => {
        const filtered = participants.filter(p =>
            p.userId !== currentUserId &&
            (p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.userId.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return {
            available: filtered.filter(p => !p.isInCall),
            inCall: filtered.filter(p => p.isInCall)
        };
    }, [participants, currentUserId, searchQuery]);

    const renderParticipant = (participant: Participant) => {
        const isTyping = typingUsers.includes(participant.userId);

        return (
            <div
                key={participant.socketId}
                className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 group transition-all hover:border-blue-400 dark:hover:border-blue-500"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm text-sm transition-transform group-hover:scale-105`}>
                            {participant.username.substring(0, 2).toUpperCase()}
                        </div>
                        {/* Inline Mood Badge */}
                        {participant.mood && (
                            <span className="absolute -top-1 -right-1 text-xs bg-white dark:bg-slate-900 rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                {participant.mood}
                            </span>
                        )}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${participant.isInCall ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    </div>
                    <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                                {participant.username}
                            </p>
                            {/* Copy ID Icon - Hidden by default, shown on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(participant.userId);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-500 transition-opacity"
                                title="Copy ID"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                            </button>
                        </div>
                        {isTyping ? (
                            <p className="text-[10px] text-blue-500 animate-pulse font-medium">typing...</p>
                        ) : (
                            <p className="text-[10px] text-slate-500 truncate font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                {participant.userId.substring(0, 8)}...
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onInviteChat(participant.userId)}
                        disabled={participant.isInCall}
                        className="flex-1 text-[10px] font-bold py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => onInviteVideo(participant.userId)}
                        disabled={participant.isInCall}
                        className="flex-1 text-[10px] font-bold py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Video
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full max-h-[400px] w-full min-w-[280px]">
            {/* Header & Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search anonymous users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all pr-8"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-2.5 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Scrollable List Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none">
                {participants.length <= 1 ? (
                    <div className="text-center text-slate-500 py-8">
                        <p className="text-sm italic">Just you in this room.</p>
                    </div>
                ) : (
                    <>
                        {/* In Call Section */}
                        {inCall.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-1.5 px-1">
                                    In Call • {inCall.length}
                                </h3>
                                <div className="space-y-3">
                                    {inCall.map(renderParticipant)}
                                </div>
                            </div>
                        )}

                        {/* Available Section */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 px-1">
                                Available • {available.length}
                            </h3>
                            {available.length === 0 && searchQuery && (
                                <p className="text-center text-xs text-slate-500 py-4">No matches found.</p>
                            )}
                            <div className="space-y-3">
                                {available.map(renderParticipant)}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
