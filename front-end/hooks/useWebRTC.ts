"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface IncomingCall {
    from: string;
    fromSocketId: string;
    roomId: string;
    requestId: string;
}

export function useWebRTC(socket: Socket | null, userId: string | null, onNotify?: (message: string) => void) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
    const pendingCandidates = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
    const localStreamRef = useRef<MediaStream | null>(null);
    const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const iceServers = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const removePeer = useCallback((socketId: string) => {
        console.log(`[WebRTC] Removing Peer Connection: ${socketId}`);
        const pc = peerConnections.current[socketId];
        if (pc) {
            delete peerConnections.current[socketId]; // Delete FIRST to prevent recursion
            pc.close();
        }
        delete pendingCandidates.current[socketId];
        setRemoteStreams((prev) => {
            const newState = { ...prev };
            delete newState[socketId];
            return newState;
        });
    }, []);

    const createPeerConnection = useCallback((socketId: string, remoteUserId?: string) => {
        if (peerConnections.current[socketId]) return peerConnections.current[socketId];

        console.log(`[WebRTC] Creating PeerConnection | Socket: ${socketId} | User: ${remoteUserId || 'Unknown'}`);
        const pc = new RTCPeerConnection(iceServers);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`[WebRTC] ICE Candidate Sent -> ${socketId}`);
                socket?.emit("webrtc:signal", {
                    to: socketId,
                    from: userId,
                    signal: { type: "candidate", candidate: event.candidate.toJSON() },
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`[WebRTC] Remote Track Received from ${socketId}`);
            setRemoteStreams((prev) => ({
                ...prev,
                [socketId]: event.streams[0],
            }));
        };

        pc.onconnectionstatechange = () => {
            console.log(`[WebRTC] Connection State (${socketId}): ${pc.connectionState}`);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                removePeer(socketId);
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        peerConnections.current[socketId] = pc;
        return pc;
    }, [socket, userId, removePeer]);

    const processPendingCandidates = async (socketId: string, pc: RTCPeerConnection) => {
        const candidates = pendingCandidates.current[socketId] || [];
        if (candidates.length > 0) {
            console.log(`[WebRTC] Applying ${candidates.length} Buffered ICE Candidates for ${socketId}`);
            for (const candidate of candidates) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("[WebRTC] ICE Error", e));
            }
            delete pendingCandidates.current[socketId];
        }
    };

    const startLocalStream = async () => {
        try {
            console.log("[WebRTC] Accessing Media Devices...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error("[WebRTC] Media Device Error:", error);
            return null;
        }
    };

    const callUser = async (targetUserId: string, roomId: string) => {
        const stream = await startLocalStream();
        if (!stream) return;

        setIsCalling(true);
        console.log(`[WebRTC] Initiating Call to ${targetUserId} in room ${roomId}...`);
        socket?.emit("video-call:request", { to: targetUserId, from: userId, roomId });

        // Start client-side timeout UI feedback (Optional, but good for UX)
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = setTimeout(() => {
            console.log("[WebRTC] Call Timeout UI Feedback triggered");
            // Here we could update UI state for 'No Answer'
        }, 31000); // Slightly longer than server timeout
    };

    const joinGroupVideo = async (roomId: string) => {
        const stream = await startLocalStream();
        if (!stream) return;

        setIsCalling(true);
        console.log(`[WebRTC] Joining Group Video: ${roomId}`);
        socket?.emit("group-video:join", roomId);
    };

    const handleInvite = useCallback(async (accept: boolean) => {
        if (!incomingCall) return;

        if (accept) {
            await startLocalStream();
            setIsCalling(true);
            console.log(`[WebRTC] Call Accepted from ${incomingCall.from}`);
            socket?.emit("video-call:accept", {
                to: incomingCall.from,
                from: userId,
                roomId: incomingCall.roomId,
                requestId: incomingCall.requestId
            });
        } else {
            console.log(`[WebRTC] Call Rejected from ${incomingCall.from}`);
            socket?.emit("video-call:reject", {
                to: incomingCall.from,
                from: userId,
                roomId: incomingCall.roomId,
                requestId: incomingCall.requestId
            });
        }
        setIncomingCall(null);
    }, [incomingCall, socket, userId]);

    const hangup = (roomId?: string) => {
        setIsCalling(false);
        console.log("[WebRTC] Hanging Up All Connections");
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            localStreamRef.current = null;
        }

        Object.keys(peerConnections.current).forEach(id => removePeer(id));

        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
        socket?.emit("video-call:hangup", { roomId: roomId, from: userId });
    };

    useEffect(() => {
        if (!socket) return;

        // --- Registration ---
        const handleRegister = () => {
            if (userId) {
                // Try to find username from localStorage as a fallback
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const username = user?.username || localStorage.getItem('anonymousName') || null;

                console.log(`[Socket] Registering User: ID=${userId}, Username=${username}`);
                socket.emit("register-user", { userId, username });
            }
        };

        if (socket.connected) handleRegister();
        socket.on("connect", handleRegister);
        socket.on("registration_complete", ({ socketId }) => {
            console.log(`[Socket] Registration Confirmed: ${socketId}`);
            setIsRegistered(true);
        });

        // --- Invitation Events ---
        socket.on("video-call:received", (data: IncomingCall) => {
            console.log(`[WebRTC] Call Received from ${data.from} (${data.fromSocketId})`);
            setIncomingCall(data);
        });

        socket.on("video-call:accepted", async ({ from, fromSocketId }) => {
            console.log(`[WebRTC] Call Accepted by ${from}. Starting Handshake.`);
            if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
            const pc = createPeerConnection(fromSocketId, from);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log("[WebRTC] Offer Sent");
            socket.emit("webrtc:signal", { to: fromSocketId, from: userId, signal: offer });
        });

        socket.on("video-call:rejected", ({ from }) => {
            console.log(`[WebRTC] Call Rejected by ${from}`);
            if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
            if (onNotify) onNotify(`Call rejected by ${from}`);
            setIsCalling(false);
        });

        socket.on("video-call:timeout", ({ to }) => {
            console.log(`[WebRTC] Call to ${to} Timed Out`);
            if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
            if (onNotify) onNotify(`No answer from ${to}`);
            setIsCalling(false);
            hangup();
        });

        socket.on("video-call:timeout-received", () => {
            console.log("[WebRTC] Incoming Call Timed Out (Peer stopped waiting)");
            setIncomingCall(null);
        });

        socket.on("video-call:hungup", ({ from, fromSocketId }) => {
            console.log(`[WebRTC] Hangup received from ${from || 'Peer'}`);
            if (fromSocketId) removePeer(fromSocketId);
            else if (!fromSocketId && !isCalling) {
                // Public call cleanup if we don't have socketId
                Object.keys(peerConnections.current).forEach(id => removePeer(id));
                setIsCalling(false);
            }
        });

        // --- signaling (SDP & ICE) ---
        socket.on("webrtc:signal", async ({ from, fromSocketId, signal }) => {
            const senderId = fromSocketId || from;
            let pc = peerConnections.current[senderId];

            if (!pc && (signal.type === "offer" || signal.type === "candidate")) {
                console.log(`[WebRTC] New Peer signaling: ${senderId}`);
                pc = createPeerConnection(senderId, from);
            }

            if (!pc) return;

            if (signal.type === "offer") {
                console.log(`[WebRTC] Offer Received from ${senderId}`);
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log("[WebRTC] Answer Sent");
                socket.emit("webrtc:signal", { to: senderId, from: userId, signal: answer });
                await processPendingCandidates(senderId, pc);
            } else if (signal.type === "answer") {
                console.log(`[WebRTC] Answer Received from ${senderId}`);
                await pc.setRemoteDescription(new RTCSessionDescription(signal));
                await processPendingCandidates(senderId, pc);
            } else if (signal.type === "candidate") {
                console.log(`[WebRTC] ICE Candidate Received from ${senderId}`);
                if (pc.remoteDescription) {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(e => console.error("[WebRTC] ICE Error", e));
                } else {
                    console.log(`[WebRTC] Buffering ICE Candidate from ${senderId}`);
                    if (!pendingCandidates.current[senderId]) pendingCandidates.current[senderId] = [];
                    pendingCandidates.current[senderId].push(signal.candidate);
                }
            }
        });

        // --- Group Video ---
        socket.on("group-video:user-joined", async ({ userId: remoteUserId, socketId: remoteSocketId }) => {
            if (remoteSocketId === socket.id) return;
            console.log(`[WebRTC] Group Peer Joined: ${remoteUserId} (Socket: ${remoteSocketId})`);
            const pc = createPeerConnection(remoteSocketId, remoteUserId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log("[WebRTC] Group Offer Sent");
            socket.emit("webrtc:signal", { to: remoteSocketId, from: userId, signal: offer });
        });

        return () => {
            socket.off("connect");
            socket.off("registration_complete");
            socket.off("video-call:received");
            socket.off("video-call:accepted");
            socket.off("video-call:rejected");
            socket.off("video-call:timeout");
            socket.off("video-call:timeout-received");
            socket.off("video-call:hungup");
            socket.off("webrtc:signal");
            socket.off("group-video:user-joined");
        };
    }, [socket, userId, createPeerConnection, removePeer, isCalling, onNotify]);

    return {
        localStream,
        remoteStreams,
        isCalling,
        incomingCall,
        isRegistered,
        callUser,
        joinGroupVideo,
        handleInvite,
        hangup
    };
}
