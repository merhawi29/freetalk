"use client";
import { useState } from "react";
import { Message } from "../types";

export function useMessages(roomId: string, username: string | null) {
  const [messages, setMessages] = useState<Message[]>([
    { user: "Someone", text: "Hi, I feel stressed today 😔", self: false },
  ]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !username) return;
    setMessages((prev) => [
      ...prev,
      { user: username, text, self: true, timestamp: new Date().toISOString() },
    ]);
  };

  return { messages, sendMessage };
}
