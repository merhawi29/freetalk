"use client";

import { useState } from "react";
import { inviteUser } from "../services/api";

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
}

export default function InviteUserModal({ isOpen, onClose, roomId }: InviteUserModalProps) {
    const [userId, setUserId] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const data = await inviteUser(roomId, userId);
            setStatus("success");
            setMessage(data.message || "Invitation sent successfully!");
            setTimeout(() => {
                onClose();
                setStatus("idle");
                setMessage("");
                setUserId("");
            }, 1500);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.response?.data?.message || "Failed to invite user");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 animate-scale-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite User</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg mb-4 text-sm text-center ${status === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User ID</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Enter User ID to invite"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-1">Ask the user for their ID found in the console/profile.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25"
                    >
                        {status === 'loading' ? 'Sending...' : 'Send Invitation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
