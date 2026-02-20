"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function TalkRoomPage() {
    const params = useParams();
    const roomId = params.roomId;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Room: {roomId}</h1>
            <p className="text-slate-400">This page is under construction.</p>
            <a href="/" className="mt-8 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors">
                Back to Home
            </a>
        </div>
    );
}
