"use client";
import { useState } from "react";

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="bg-gray-900 p-4 flex gap-2 border-t border-gray-800">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type your message..."
        className="flex-1 bg-gray-800 rounded-xl px-4 py-2 outline-none placeholder-gray-500"
      />
      <button onClick={handleSend} className="bg-blue-600 px-5 rounded-xl hover:bg-blue-700">
        Send
      </button>
    </div>
  );
}
