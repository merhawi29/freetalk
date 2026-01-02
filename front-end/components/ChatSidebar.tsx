"use client";

import { useEffect, useState } from "react";
import { getRooms, deleteRoom } from "../services/api";
import { useSocket } from "../context/SocketContext";

interface ChatSidebarProps {
    onSelectRoom: (roomId: string) => void;
    onCreateRoom: () => void;
    currentRoomId: string;
    username: string;
    userId: string;
}

interface Room {
    _id: string;
    name: string;
    roomId: string;
    isPublic: boolean;
    owner?: {
        _id: string;
        username: string;
    } | string;
}

export default function ChatSidebar({ onSelectRoom, onCreateRoom, currentRoomId, username, userId }: ChatSidebarProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

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

    const isOwner = (room: Room) => {
        if (!room.owner) return false;
        if (typeof room.owner === 'string') return room.owner === userId;
        return room.owner._id === userId;
    };

    const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this room and all its messages?")) {
            try {
                await deleteRoom(roomId);
                fetchRooms();
                if (currentRoomId === roomId) {
                    onSelectRoom("");
                }
            } catch (error) {
                console.error("Failed to delete room", error);
                alert("Failed to delete room. You might not be the owner.");
            }
        }
    };

    useEffect(() => {
        fetchRooms();

        if (socket) {
            socket.on("rooms_updated", () => {
                console.log("Sidebar: Rooms updated event received");
                fetchRooms();
            });
        }

        return () => {
            if (socket) {
                socket.off("rooms_updated");
            }
        };
    }, [socket]);

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
                        <div
                            key={room._id}
                            onClick={() => onSelectRoom(room.roomId)}
                            className={`w-full text-left p-4 rounded-xl transition-all border group cursor-pointer ${currentRoomId === room.roomId
                                ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20"
                                : "bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                                }`}
                        >
                            <div className="font-bold flex justify-between items-center">
                                <span className="truncate">{room.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!room.isPublic && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
                                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {isOwner(room) && (
                                        <button
                                            onClick={(e) => handleDeleteRoom(e, room.roomId)}
                                            className={`p-1 rounded-md transition-all ${currentRoomId === room.roomId ? 'hover:bg-white/20 text-white/70 hover:text-white' : 'hover:bg-red-500/10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                                            title="Delete Room"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs opacity-70 mt-1 truncate">
                                ID: {room.roomId}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{username}</p>
                        <p
                            className="text-[10px] text-slate-500 truncate cursor-pointer hover:text-blue-500 transition-colors"
                            title="Click to copy your ID"
                            onClick={() => {
                                navigator.clipboard.writeText(userId);
                                alert("User ID copied to clipboard!");
                            }}
                        >
                            ID: {userId}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
