"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";

interface RoomStats {
  [key: string]: number;
}

export default function LandingPage() {
  const [stats, setStats] = useState<RoomStats>({});

  const categories = [
    { id: "stress", name: "Stress & Anxiety", icon: "🧘", desc: "Find calm and support." },
    { id: "career", name: "Career Talk", icon: "💼", desc: "Discuss work and goals." },
    { id: "relationships", name: "Relationships", icon: "❤️", desc: "Heart to heart talk." },
    { id: "random", name: "Random Chat", icon: "🎲", desc: "Meet new people." },
  ];

  useEffect(() => {
    // Initial Fetch
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rooms/stats");
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();

    // Socket Listener for Live Updates
    const socket = io("http://localhost:5000");
    socket.on("room_stats_update", (updatedStats: RoomStats) => {
      setStats(updatedStats);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

        <div className="container mx-auto px-6 pt-32 pb-20 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
            Talk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">freely</span>, <br />
            safely, anonymously.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            FreeTalk is a safe space to share your thoughts without judgment.
            No sign-ups, no tracking—just pure connection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Start Anonymous Chat
            </Link>
            <Link
              href="#rooms"
              className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full font-bold text-lg transition-all border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
            >
              Explore Rooms
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div id="rooms" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-slate-900 dark:text-white">Join a Room</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 hover:shadow-xl dark:hover:shadow-none transition-all dark:hover:bg-slate-800/50">
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{cat.desc}</p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {stats[cat.id] || 0} online
                </span>

                <Link
                  href={`/chat?room=${cat.id}`}
                  className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  Join
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-950 py-24 transition-colors duration-300">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto bg-white/70 dark:bg-slate-800/30 p-10 rounded-3xl border border-white/50 dark:border-slate-700/50 backdrop-blur-sm shadow-xl dark:shadow-none">
            <p className="text-2xl md:text-4xl font-serif italic text-slate-700 dark:text-slate-300 mb-6">
              "Everything happens for a reason, and often for a better one."
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-bold">— Reminder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
