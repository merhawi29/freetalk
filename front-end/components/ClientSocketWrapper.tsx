"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useRouter } from "next/navigation";
import { joinRoom } from "../services/api";
import InvitationPopup from "./InvitationPopup";

export default function ClientSocketWrapper({ children }: { children: React.ReactNode }) {
    const [incomingInvitation, setIncomingInvitation] = useState<{ roomId: string, name: string, inviter: string } | null>(null);
    const { socket } = useSocket();
    const router = useRouter();

    useEffect(() => {
        if (!socket) return;

        socket.on("invitation_received", (data: any) => {
            console.log("Global Socket Wrapper: Invitation received", data);

            // Safety check: Don't show popup if I am the inviter (prevents 'echo' in shared session testing)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const me = JSON.parse(userStr);
                const myId = me._id || me.id;
                if (myId === data.inviterId || (me.username && me.username === data.inviter)) {
                    console.log("Global Socket Wrapper: Ignoring invitation sent by myself");
                    return;
                }
            }

            setIncomingInvitation(data);
        });

        return () => {
            socket.off("invitation_received");
        };
    }, [socket]);

    const handleAccept = async (roomId: string) => {
        try {
            await joinRoom(roomId);
            setIncomingInvitation(null);
            router.push(`/chat?room=${roomId}`);
        } catch (err) {
            console.error("Failed to join room", err);
        }
    };

    return (
        <>
            <InvitationPopup
                invitation={incomingInvitation}
                onAccept={handleAccept}
                onReject={() => setIncomingInvitation(null)}
            />
            {children}
        </>
    );
}
