"use client";

import { useEffect, useState } from "react";
import { getRooms } from "../services/api";

interface ChatSidebarProps {
    onSelectRoom: (roomId: string) => void;
    onCreateRoom: () => void;
    currentRoomId: string;
}

interface Room {
    _id: string;
    name: string;
    roomId: string;
    isPublic: boolean;
}

export default function ChatSidebar({ onSelectRoom, onCreateRoom, currentRoomId }: ChatSidebarProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await getRooms();
            setRooms(data);
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        // Optional: Poll for updates or listen to socket events for new rooms
        const interval = setInterval(fetchRooms, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                    Rooms
                </h2>
                <button
                    onClick={onCreateRoom}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md"
                    title="Create Room"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {loading ? (
                    <div className="text-center text-slate-500 py-4">Loading rooms...</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        <p>No rooms found.</p>
                        <p className="text-sm">Create one to get started!</p>
                    </div>
                ) : (
                    rooms.map((room) => (
                        <button
                            key={room._id}
                            onClick={() => onSelectRoom(room.roomId)}
                            className={`w-full text-left p-4 rounded-xl transition-all border ${currentRoomId === room.roomId
                                    ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20"
                                    : "bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                                }`}
                        >
                            <div className="font-bold flex justify-between items-center">
                                <span>{room.name}</span>
                                {!room.isPublic && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-xs opacity-70 mt-1 truncate">
                                ID: {room.roomId}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
