"use client";

interface InvitationPopupProps {
    invitation: {
        roomId: string;
        name: string;
        inviter: string;
    } | null;
    onAccept: (roomId: string) => void;
    onReject: () => void;
}

export default function InvitationPopup({ invitation, onAccept, onReject }: InvitationPopupProps) {
    if (!invitation) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-800 w-80">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.855.75.75 0 001.479.253A8.218 8.218 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.117 1 8.218 8.218 0 011.986 4.108.75.75 0 001.479-.253A9.719 9.719 0 0019.267 2.5zM12 6.75a.75.75 0 01.75.75v5.25h3.75a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75V7.5a.75.75 0 01.75-.75z" />
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">New Invitation!</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{invitation.inviter}</span> invited you to join <span className="font-semibold">{invitation.name}</span>.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onReject}
                        className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => onAccept(invitation.roomId)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
