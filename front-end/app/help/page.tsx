"use client";

import Navbar from '../../components/Navbar';

export default function HelpPage() {
    const faqs = [
        {
            question: "Is FreeTalk really anonymous?",
            answer: "Yes. When you join as a guest, we don't ask for any personal details. Even if you register, your profile is minimal, and we never sell your data."
        },
        {
            question: "How do I report abusive behavior?",
            answer: "We are working on a reporting system. For now, please contact us via the Contact page if you encounter harassment."
        },
        {
            question: "Can I delete my account?",
            answer: "Currently, account deletion must be requested via support. We are adding a self-serve delete button soon."
        },
        {
            question: "Is it free to use?",
            answer: "100% Free. Mental health support should not have a price tag."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500 text-center">
                    Help Center
                </h1>
                <p className="text-center text-slate-400 mb-12 text-lg">Frequently Asked Questions & Resources</p>

                <div className="grid gap-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-pink-500/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-2">{faq.question}</h3>
                            <p className="text-slate-400">{faq.answer}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Need Immediate Help?</h2>
                    <p className="text-slate-300 mb-6">
                        If you or someone you know is in crisis, please do not use this site. Contact professional emergency services immediately.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="tel:988" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
                            Call 988 (US Suicide & Crisis Lifeline)
                        </a>
                        <a href="https://www.befrienders.org/" target="_blank" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-slate-700">
                            Find International Helplines
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
