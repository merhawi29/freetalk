"use client";

import Navbar from '../../components/Navbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-center">
                    About FreeTalk
                </h1>

                <div className="bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                    <p>
                        <strong className="text-slate-900 dark:text-white">FreeTalk</strong> is a safe, anonymous space designed for unparalleled freedom of expression. In a world where mental health is often stigmatized, we believe everyone deserves a place to speak their mind without fear of judgment.
                    </p>

                    <p>
                        Our platform connects you with others who are going through similar life experiences. Whether you are dealing with stress, seeking career advice, navigating relationships, or just want to chat about random topics, FreeTalk provides the rooms to do so.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Our Mission</h2>
                    <p>
                        To foster a global community of support and empathy, proving that even in our darkest moments, we are never truly alone.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Why Anonymity?</h2>
                    <p>
                        Anonymity allows for honesty. We strip away profiles, photos, and status updates so that users can focus on what truly matters: human connection and authentic conversation.
                    </p>
                </div>
            </div>
        </div>
    );
}
