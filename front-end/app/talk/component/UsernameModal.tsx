"use client";
import { useState } from "react";

export function UsernameModal({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-2xl w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-2">Choose a name 💬</h2>
        <p className="text-gray-400 mb-4">
          Anonymous. No account required.
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Hope, Guest123"
          className="w-full bg-gray-800 rounded-xl px-4 py-2 mb-4 outline-none placeholder-gray-500"
        />

        <button
          onClick={() => name.trim() && onSave(name)}
          className="w-full bg-blue-600 py-2 rounded-xl hover:bg-blue-700"
        >
          Enter Chat
        </button>
      </div>
    </div>
  );
}
