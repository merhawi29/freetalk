"use client";

import Navbar from '../../components/Navbar';

export default function GuidelinesPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 text-center">
                    Community Guidelines
                </h1>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 text-lg text-slate-300">
                    <p className="text-xl font-medium text-white text-center">
                        FreeTalk is a place for support and connection. To keep it safe, we ask everyone to follow these simple rules.
                    </p>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            🚫 1. No Hate Speech
                        </h2>
                        <p>Zero tolerance for racism, sexism, homophobia, transphobia, or any form of hate speech. We are here to lift each other up, not tear each other down.</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            🧘 2. Be Respectful
                        </h2>
                        <p>Disagreements happen, but personal attacks do not belong here. Treat others with the same kindness you expect.</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            🛡️ 3. Maintain Anonymity
                        </h2>
                        <p>Do not share your own or others' personal information (doxing). Phone numbers, addresses, and full names should be kept private for your safety.</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            🔞 4. No NSFW Content
                        </h2>
                        <p>This is a general support platform. Explicit sexual content or violence is strictly prohibited.</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            🚨 5. Crisis Situations
                        </h2>
                        <p>If you see someone threatening self-harm, please direct them to our Help page resources or encourage them to seek professional help. We are a peer support network, not crisis counselors.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
