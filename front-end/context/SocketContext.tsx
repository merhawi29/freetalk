"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getCurrentUser } from "../services/api";

interface SocketContextType {
    socket: Socket | null;
    userId: string | null;
    refreshSocket: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    userId: null,
    refreshSocket: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const connectSocket = () => {
        // Disconnect existing socket if any
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const user = getCurrentUser();
        const currentId = user?._id || null;
        setUserId(currentId);

        const query = currentId ? { userId: currentId } : {};
        const newSocket = io("http://localhost:5000", {
            query,
            reconnection: true,
            reconnectionAttempts: 5
        });

        newSocket.on("connect", () => {
            console.log("Socket Context: Connected", newSocket.id, "as", currentId || "Anonymous");
            if (currentId) {
                console.log(`Socket Context: Emitting join_id for [${currentId}]`);
                newSocket.emit("join_id", currentId);
            }
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    };

    useEffect(() => {
        connectSocket();

        // Listen for storage changes (e.g. login in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                console.log("Socket Context: Storage changed, refreshing socket");
                connectSocket();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const refreshSocket = () => {
        console.log("Socket Context: Manual refresh");
        connectSocket();
    };

    return (
        <SocketContext.Provider value={{ socket, userId, refreshSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
