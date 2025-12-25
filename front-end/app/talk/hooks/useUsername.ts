"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "anonymousName";

export function useUsername() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUsername(saved);
  }, []);

  const saveUsername = (name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUsername(name);
  };

  return { username, saveUsername };
}
