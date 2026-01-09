"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSocket } from "./SocketContext";
import { useWebRTC } from "../hooks/useWebRTC";
import { VideoCallOverlay } from "../components/VideoCallOverlay";
import InvitationPopup from "../components/InvitationPopup";
import { useRouter } from "next/navigation";
import { joinRoom as joinRoomApi } from "../services/api";
import Toast from "../components/Toast";

interface VideoCallContextType {
    isCalling: boolean;
    localStream: MediaStream | null;
    remoteStreams: { [socketId: string]: MediaStream };
    callUser: (targetUserId: string, roomId: string) => Promise<void>;
    joinGroupVideo: (roomId: string) => Promise<void>;
    hangup: () => void;
    incomingCall: any;
    handleInvite: (accept: boolean) => void;
}

const VideoCallContext = createContext<VideoCallContextType | null>(null);

export const useVideoCall = () => {
    const context = useContext(VideoCallContext);
    if (!context) throw new Error("useVideoCall must be used within VideoCallProvider");
    return context;
};

export const VideoCallProvider = ({ children }: { children: React.ReactNode }) => {
    const { socket, userId } = useSocket();
    const router = useRouter();

    // The shared invitation state for ANY type of invite
    const [invitation, setInvitation] = useState<{
        roomId: string;
        name: string;
        inviter: string;
        type: 'chat' | 'video';
        requestId?: string;
    } | null>(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const handleNotify = useCallback((message: string) => {
        setToastMessage(message);
        setShowToast(true);
    }, []);

    // useWebRTC now works room-independently
    const {
        localStream,
        remoteStreams,
        isCalling,
        incomingCall,
        callUser: startWebRTCCall,
        joinGroupVideo: startGroupVideo,
        handleInvite: handleWebRTCInvite,
        hangup
    } = useWebRTC(socket, userId, handleNotify);

    // Sync WebRTC incoming calls with our global invitation UI
    useEffect(() => {
        if (incomingCall) {
            setInvitation({
                roomId: incomingCall.roomId,
                name: "Video Call",
                inviter: incomingCall.from,
                type: 'video',
                requestId: incomingCall.requestId
            });
        }
    }, [incomingCall]);

    // Handle Chat Invitations too
    useEffect(() => {
        if (!socket) return;

        const handleChatInvite = (data: any) => {
            // Self-invite check for chat
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const me = JSON.parse(userStr);
                if ((me._id || me.id) === data.inviterId) return;
            }

            setInvitation({
                roomId: data.roomId,
                name: data.name,
                inviter: data.inviter,
                type: 'chat'
            });
        };

        socket.on("invitation_received", handleChatInvite);
        return () => { socket.off("invitation_received", handleChatInvite); };
    }, [socket]);

    const handleAccept = async (roomId: string) => {
        if (!invitation) return;

        if (invitation.type === 'video') {
            await handleWebRTCInvite(true);
        } else {
            try {
                await joinRoomApi(roomId);
                router.push(`/chat?room=${roomId}`);
            } catch (err) {
                console.error("Failed to join chat", err);
            }
        }
        setInvitation(null);
    };

    const handleReject = () => {
        if (invitation?.type === 'video') {
            handleWebRTCInvite(false);
        }
        setInvitation(null);
    };

    const callUser = async (targetId: string, roomId: string) => {
        // Prevent self-call
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const anonymousName = localStorage.getItem('anonymousName');
        const myName = user.username || anonymousName;
        const myId = user._id || user.id;

        if (targetId === myName || targetId === myId) {
            alert("You cannot call yourself!");
            return;
        }

        await startWebRTCCall(targetId, roomId);
    };

    const value = {
        isCalling,
        localStream,
        remoteStreams,
        callUser,
        joinGroupVideo: (roomId: string) => startGroupVideo(roomId),
        hangup,
        incomingCall,
        handleInvite: handleWebRTCInvite
    };

    return (
        <VideoCallContext.Provider value={value}>
            {children}

            <InvitationPopup
                invitation={invitation ? { ...invitation, name: invitation.type === 'video' ? 'Video Call' : invitation.name } : null}
                onAccept={handleAccept}
                onReject={handleReject}
            />

            {isCalling && (
                <VideoCallOverlay
                    localStream={localStream}
                    remoteStreams={remoteStreams}
                    onHangup={hangup}
                />
            )}

            {showToast && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100]">
                    <Toast message={toastMessage} onClose={() => setShowToast(false)} />
                </div>
            )}
        </VideoCallContext.Provider>
    );
};
