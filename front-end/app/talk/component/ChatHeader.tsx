export function ChatHeader({ roomId }: { roomId: string }) {
    return (
      <header className="bg-gray-900 text-white p-4 text-center font-semibold border-b border-gray-800">
        Anonymous Chat Room: {roomId}
      </header>
    );
  }
  