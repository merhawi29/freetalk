export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Free Talk 💬</h1>
        <p className="text-gray-600 mb-6">
          A safe place to talk freely and anonymously.
        </p>

        <a
          href="/talk"
          className="block bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Start Talking
        </a>
      </div>
    </main>
  );
}
