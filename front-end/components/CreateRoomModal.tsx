"use client";

import { useState } from "react";
import { createRoom } from "../services/api";

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoomCreated: (room: any) => void;
}

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const room = await createRoom(name, roomId, isPublic);
            onRoomCreated(room);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error creating room");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Room</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="e.g. Chill Lounge"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room ID (Unique)</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="e.g. chill-lounge-1"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700">
                        <input
                            type="checkbox"
                            checked={!isPublic}
                            onChange={(e) => setIsPublic(!e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                        />
                        <div>
                            <span className="text-slate-900 dark:text-white font-medium">Private Room</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Only invited users can join</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 mt-4"
                    >
                        Create Room
                    </button>
                </form>
            </div>
        </div>
    );
}
