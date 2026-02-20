"use client";

import React, { useState, useRef, useEffect } from "react";
import ParticipantsList from "./ParticipantsList";

interface Participant {
    socketId: string;
    userId: string;
    username: string;
    isInCall?: boolean;
    mood?: string;
}

interface ParticipantsDropdownProps {
    participants: Participant[];
    currentUserId: string;
    typingUsers?: string[];
    onInviteChat: (targetUserId: string) => void;
    onInviteVideo: (targetUserId: string) => void;
}

export default function ParticipantsDropdown({
    participants,
    currentUserId,
    typingUsers = [],
    onInviteChat,
    onInviteVideo,
}: ParticipantsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isOpen
                        ? "bg-blue-600 text-white border-blue-500 shadow-md scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
            >
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${participants.length > 0 ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}></span>
                    <span className="text-sm font-bold truncate max-w-[120px]">
                        Participants {participants.length}
                    </span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Online Now</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                            </svg>
                        </button>
                    </div>
                    <ParticipantsList
                        participants={participants}
                        currentUserId={currentUserId}
                        typingUsers={typingUsers}
                        onInviteChat={(targetId) => {
                            onInviteChat(targetId);
                            setIsOpen(false);
                        }}
                        onInviteVideo={(targetId) => {
                            onInviteVideo(targetId);
                            setIsOpen(false);
                        }}
                    />
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400 text-center">
                        <p>Privacy-protected room context</p>
                    </div>
                </div>
            )}
        </div>
    );
}
