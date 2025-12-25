import { Message } from "../types";

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map((msg, i) => (
        <div key={i} className={`max-w-xs ${msg.self ? "ml-auto text-right" : ""}`}>
          <p className="text-xs text-gray-400 mb-1">{msg.user}</p>
          <div className={`p-3 rounded-2xl ${msg.self ? "bg-blue-600" : "bg-gray-800"}`}>
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
