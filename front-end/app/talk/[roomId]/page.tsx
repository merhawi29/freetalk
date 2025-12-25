"use client";
import { useUsername } from "../hooks/useUsername";
import { useMessages } from "../hooks/useMessages";
import { UsernameModal } from "../component/UsernameModal"
import { ChatHeader } from "../component/ChatHeader";
import { MessageList } from "../component/MessageList";
import { MessageInput } from "../component/MessageInput";

interface RoomPageProps {
  params: { roomId: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = params;
  const { username, saveUsername } = useUsername();
  const { messages, sendMessage } = useMessages(roomId, username);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {!username && <UsernameModal onSave={saveUsername} />}
      <ChatHeader roomId={roomId} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
