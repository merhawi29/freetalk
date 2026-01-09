"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    userId: string | null;
    refreshSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const initializeSocket = useCallback(() => {
        // Clear existing socket if any
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const userStr = localStorage.getItem("user");
        let currentUserId = null;
        let currentUsername = null;

        if (userStr) {
            const user = JSON.parse(userStr);
            currentUserId = user._id || user.id;
            currentUsername = user.username;
        } else {
            currentUsername = localStorage.getItem("anonymousName");
        }

        setUserId(currentUserId);

        const newSocket = io("http://localhost:5000");
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("[Socket] Connected:", newSocket.id);
            if (currentUserId || currentUsername) {
                newSocket.emit("register-user", {
                    userId: currentUserId,
                    username: currentUsername
                });
            }
        });

        newSocket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
        });

        return newSocket;
    }, []);

    useEffect(() => {
        const newSocket = initializeSocket();
        return () => {
            newSocket.disconnect();
        };
    }, [initializeSocket]);

    const refreshSocket = useCallback(() => {
        console.log("[Socket] Refreshing socket connection...");
        initializeSocket();
    }, [initializeSocket]);

    return (
        <SocketContext.Provider value={{ socket, userId, refreshSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
