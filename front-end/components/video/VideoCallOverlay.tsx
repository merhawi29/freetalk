"use client";

import { useEffect, useRef } from "react";

interface VideoCallOverlayProps {
    localStream: MediaStream | null;
    remoteStreams: { [socketId: string]: MediaStream };
    onHangup: () => void;
}

export function VideoCallOverlay({ localStream, remoteStreams, onHangup }: VideoCallOverlayProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 flex flex-wrap gap-2 p-2">
                {/* Remote Streams */}
                {Object.entries(remoteStreams).map(([socketId, stream]) => (
                    <RemoteVideo key={socketId} stream={stream} />
                ))}

                {/* Placeholder if no remote streams */}
                {Object.keys(remoteStreams).length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Waiting for others to join...</p>
                    </div>
                )}

                {/* Local Stream (PIP) */}
                <div className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-lg border-2 border-blue-500 overflow-hidden shadow-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover mirror"
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={onHangup}
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.026 6.474 14.5 14.5 14.5h1a2 2 0 002-2v-3a2 2 0 00-2-2 3 3 0 01-3-3V7a2 2 0 00-2-2H5z" />
                    </svg>
                </button>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}

function RemoteVideo({ stream }: { stream: MediaStream }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="flex-1 min-w-[300px] bg-black rounded-lg overflow-hidden border border-gray-800">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
        </div>
    );
}
