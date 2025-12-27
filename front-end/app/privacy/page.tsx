"use client";

import Navbar from '../../components/Navbar';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500 text-center">
                    Privacy Policy
                </h1>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-slate-300">
                    <p className="text-sm text-slate-500 mb-4">Last Updated: December 2025</p>

                    <h2 className="text-2xl font-bold text-white mt-6">1. Information We Collect</h2>
                    <p>
                        We believe in data minimization.
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Guests:</strong> We collect no personal data. You are identified only by a temporary session ID.</li>
                            <li><strong>Registered Users:</strong> We collect your username, encrypted password, and optional email address.</li>
                        </ul>
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-6">2. How We Use Information</h2>
                    <p>
                        Your data is used solely to functionality of the app (e.g., logging you in, showing your profile). We do not sell, trade, or rent user identification information to others.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-6">3. Chat Logs</h2>
                    <p>
                        Messages are stored to allow for chat history when you rejoin a room. However, we do not actively monitor private chats unless a report is filed for violation of our Community Guidelines.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-6">4. Cookies</h2>
                    <p>
                        We use local storage on your device to keep you logged in. We do not use third-party tracking cookies.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-6">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us via our Contact form.
                    </p>
                </div>
            </div>
        </div>
    );
}
