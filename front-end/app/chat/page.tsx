"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createUser, createRoom, sendMessage, getMessages, getRoom, getCurrentUser, joinRoom } from "../../services/api";
import { io } from "socket.io-client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';
import ChatSidebar from "../../components/ChatSidebar";
import CreateRoomModal from "../../components/CreateRoomModal";
import InviteUserModal from "../../components/InviteUserModal";
import Toast from "../../components/Toast";
import InvitationPopup from "../../components/InvitationPopup";
import InviteVideoModal from "../../components/InviteVideoModal";

import { useSocket } from "../../context/SocketContext";
import { useVideoCall } from "../../context/VideoCallContext";

interface Message {
    _id: string;
    sender: { username: string; isAnonymous: boolean };
    content: string;
    createdAt: string;
}

function ChatContent() {
    const [step, setStep] = useState<"user" | "chat">("user");
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [roomId, setRoomId] = useState("");
    const [userCount, setUserCount] = useState(0);

    const { socket, refreshSocket } = useSocket();

    const {
        callUser,
        joinGroupVideo
    } = useVideoCall();

    const [inviteToVideoId, setInviteToVideoId] = useState("");
    const [isInviteVideoModalOpen, setIsInviteVideoModalOpen] = useState(false);

    // Chat State
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    // UI State
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const roomParam = searchParams.get("room");

    useEffect(() => {
        // Check for logged in user
        const user = getCurrentUser();
        if (user) {
            setUsername(user.username);
            setUserId(user._id);
            setStep("chat"); // Directly go to chat interface (sidebar will show)
        }
    }, []); // Check once on mount

    useEffect(() => {
        if (roomParam) {
            setRoomId(roomParam);
            const user = getCurrentUser();
            if (user?._id) {
                handleJoinRoom(roomParam);
            }
        }
    }, [roomParam]);

    useEffect(() => {
        if (!socket || step !== "chat" || !roomId) return;

        console.log(`ChatPage: Joining room [${roomId}] as user [${userId}]`);
        socket.emit("join_room", roomId);

        const handleReceiveMessage = (newMessage: Message) => {
            console.log("ChatPage: Message received via socket", newMessage);
            setMessages((prev) => [...prev, newMessage]);
        };

        const handleRoomCount = (count: number) => {
            console.log("ChatPage: User count update", count);
            setUserCount(count);
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("room_user_count", handleRoomCount);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("room_user_count", handleRoomCount);
        }
    }, [socket, step, roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleRegister = async () => {
        if (!username.trim()) return;
        try {
            const user = await createUser(username);
            setUserId(user._id);
            setStep("chat");

            // CRITICAL: Refresh the socket connection now that we have a userId
            refreshSocket();

            if (roomParam) {
                handleJoinRoom(roomParam);
            }
            setError("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Error creating user");
        }
    };

    const handleJoinRoom = async (id: string = roomId) => {
        if (!id.trim()) return;
        try {
            // Call joinRoom API to ensure user is in participants list
            try {
                await joinRoom(id);
            } catch (joinErr) {
                console.error("Failed to join room via API", joinErr);
                // If it's private and no invite, this might fail, which is correct
            }

            setRoomId(id);
            setStep("chat");
            setError("");

            // Fetch messages
            const msgs = await getMessages(id);
            setMessages(msgs);

            // Update URL without reload
            router.push(`/chat?room=${id}`);

        } catch (err: any) {
            setError(err.response?.data?.message || "Error joining room");
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            await sendMessage(roomId, userId, message);
            setMessage("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleRoomCreated = (room: any) => {
        handleJoinRoom(room.roomId);
    };

    if (step === "user") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl dark:shadow-2xl animate-fade-in-up relative">
                    <Link href="/" className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                        </svg>
                    </Link>
                    <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                        Welcome
                    </h2>
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Choose a username to join the chat.</p>

                    <input
                        className="w-full p-4 mb-4 bg-gray-50 dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="Enter a username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    />
                    <button
                        onClick={handleRegister}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold p-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-blue-500/25"
                    >
                        Start Chatting
                    </button>
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300 overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:block">
                <ChatSidebar
                    onSelectRoom={handleJoinRoom}
                    onCreateRoom={() => setIsCreateModalOpen(true)}
                    currentRoomId={roomId}
                    username={username}
                    userId={userId}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Mobile Header / Sidebar Toggle would go here */}

                {showToast && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
                    </div>
                )}

                <CreateRoomModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onRoomCreated={handleRoomCreated}
                />

                <InviteUserModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    roomId={roomId}
                />

                <InviteVideoModal
                    isOpen={isInviteVideoModalOpen}
                    onClose={() => setIsInviteVideoModalOpen(false)}
                    onStartCall={(targetId) => callUser(targetId, roomId)}
                />

                {!roomId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-slate-400">
                                <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Select a Room</h2>
                        <p>Choose a room from the sidebar or create a new one to start chatting.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg font-bold md:hidden"
                        >
                            Create Room
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white/90 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="md:hidden">
                                    {/* Mobile back button/menu trigger could go here */}
                                    {/* For now just a simple back to 'no room' state visually if needed, but sidebar manages nav */}
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg text-white">
                                    {roomId.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{roomId}</h3>
                                    <p className="text-xs text-green-500 dark:text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></span>
                                        Live • {userCount} online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                                    </svg>
                                    Invite
                                </button>

                                <button
                                    onClick={() => setIsInviteVideoModalOpen(true)}
                                    className="text-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                                    </svg>
                                    Call
                                </button>

                                <button
                                    onClick={() => joinGroupVideo(roomId)}
                                    className="text-sm bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Group
                                </button>
                                <Link href="/" className="text-sm bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                    Exit
                                </Link>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800 bg-gray-50 dark:bg-slate-800/50">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 opacity-50">
                                    <p>No messages yet.</p>
                                    <p className="text-sm">Be the first to say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender.username === username;
                                    const isSequence = index > 0 && messages[index - 1].sender.username === msg.sender.username;
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isSequence ? "mt-1" : "mt-4"}`}
                                        >
                                            {!isMe && !isSequence && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 ml-1">
                                                    {msg.sender.username}
                                                </span>
                                            )}
                                            <div
                                                className={`px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-sm transition-all hover:shadow-md ${isMe
                                                    ? "bg-blue-600 text-white rounded-br-none"
                                                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-transparent rounded-bl-none"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex gap-2 relative">
                                <input
                                    className="flex-1 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-12"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim()}
                                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 font-bold transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
            <ChatContent />
        </Suspense>
    );
}
