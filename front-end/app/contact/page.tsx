"use client";

import Navbar from '../../components/Navbar';
import { useState } from 'react';
import Toast from '../../components/Toast';

export default function ContactPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send an email via API
        setShowToast(true);
        setEmail('');
        setMessage('');
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Navbar />

            {showToast && <Toast message="Message sent! We'll get back to you soon." onClose={() => setShowToast(false)} type="success" />}

            <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 text-center">
                    Contact Us
                </h1>
                <p className="text-center text-slate-400 mb-12 text-lg">Have questions, suggestions, or just want to say hi? <br /> We'd love to hear from you.</p>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Your Email</label>
                            <input
                                type="email"
                                required
                                className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                            <textarea
                                required
                                rows={5}
                                className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                                placeholder="How can we help?"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/25"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center text-slate-500">
                    <p>Or email us directly at</p>
                    <a href="mailto:support@freetalk.com" className="text-green-400 hover:text-green-300 font-medium transition-colors">support@freetalk.com</a>
                </div>
            </div>
        </div>
    );
}
