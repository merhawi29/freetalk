"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateProfile } from '../../services/api';
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        setUsername(currentUser.username);
        setEmail(currentUser.email);
        setBio(currentUser.bio || '');
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const updatedUser = await updateProfile({
                username,
                email,
                bio,
                ...(password ? { password } : {})
            }, user.token);

            setUser(updatedUser);
            setMessage('Profile updated successfully!');
            setPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Navbar />
            <div className="container mx-auto px-6 pt-32 pb-20 max-w-2xl">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold border-4 border-slate-800 shadow-xl">
                            {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
                            <p className="text-slate-400">{user.email}</p>
                        </div>
                    </div>

                    {/* User ID Section */}
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 mb-8 flex items-center justify-between group">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">User ID</p>
                            <code className="text-slate-300 font-mono text-sm">{user._id}</code>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(user._id);
                                setMessage('User ID copied to clipboard!');
                                setTimeout(() => setMessage(''), 3000);
                            }}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                            title="Copy ID"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                            </svg>
                        </button>
                    </div>

                    {message && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                                <input
                                    className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                <input
                                    className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                            <textarea
                                className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 min-h-[100px]"
                                placeholder="Tell us about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">New Password (Optional)</label>
                            <input
                                type="password"
                                className="w-full p-4 bg-slate-950 rounded-xl border border-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="Leave blank to keep current password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex justify-end">
                            <button
                                type="submit"
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
